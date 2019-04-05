const router = require("express")();

const Row = require("../models/row");


// route to get array of all the booked seats in database
router.get("/seats", async (req, res) => {
  try {
    const rows = await Row.find();

    let rowArr = [];
    for (let row of rows) {
      // create a new array depending upon number of reserved seats
      let arr = [...Array(row.totalSeats - row.availableSeats).keys()]
       .map(el => el + (row.rowNo - 1) * 7  + 1);
      rowArr = [...rowArr, ...arr];
    }

    res.status(200).json(rowArr);
  } catch (error) {
    console.log(error);
    res.status(500).json({message: 'Something went wrong'});
  }
});


// route to get all the rows from database
router.get("", async (req, res) => {
  try {
    const result = await Row.find();

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({message: 'Something went wrong'});
  }
});


// route to post a new reservation
router.post("", async (req, res) => {
  try {
    const seatsReq = +req.body.seatsReq;

    // restrict max 7 reservations at a single time
    if (!seatsReq || seatsReq > 7) {
      return res.status(200).json({
        message: 'Maximum 7 reservations are allowed at a time.'
      })
    }

    // calculate total number of available seats in database
    const sum = await Row.aggregate([{
      $group: {
        _id: null,
        total: { $sum: "$availableSeats" }
      }
    }]);

    // return with a message if required number of seats are not available
    if (sum[0].total === 0) {
      return res.status(200).json({
        message: 'Oops! No more seats available.'
      });
    }
    if (!sum[0].total || sum[0].total < seatsReq) {
      return res.status(200).json({
        message: `Only ${sum[0].total} seat(s) left.`
      });
    };


    let result;
    let row = await Row.findOne({availableSeats: {$gte: seatsReq}})
     .sort("availableSeats");

     // if required seats are available in a single row
    if (row) {
      result = await insertToSameRow(row, seatsReq);  // will return array of seats assigned to user
    } else {
      // if seats in a single row are not available

      rows = await Row.find({
        $and: [
          { availableSeats: { $lt: seatsReq }},
          { availableSeats: { $ne: 0 }}
        ]
      }).sort("-availableSeats");

      result = await insertToNearestRow(rows, seatsReq);  // will return array of seats assigned to user
    }

    res.status(200).json({
      message: 'Reservation done!',
      result
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({message: 'Something went wrong'});
  }
});

// route to clear all seats from rows
router.delete("", async (req, res) => {
  try {
    await Row.updateMany({ totalSeats: 7 }, {
      $set: { availableSeats: 7 }
    });

    const result = await Row.updateOne({ totalSeats: 3 }, {
      $set: { availableSeats: 3 }
    });

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({message: 'Something went wrong'});
  }
});





// if same no. of seats are available in a row
async function insertToSameRow(row, seatsReq) {
  // array of seat numbers assigned to user
  const seatNoArr = getSeatNumberArr(row, seatsReq);
  await Row.findByIdAndUpdate( row._id, {
    $set: {
        availableSeats: row.availableSeats
      }
    }, { new: true }
  );

  return seatNoArr;
}



// if less than required seats are available in all rows
async function insertToNearestRow(rows, seatsReq) {

  // first of all insert as many seats to row with max seats available
  let seatNoArr = await insertToSameRow(rows[0], seatsReq);

  // then sort the array to get nearby rows on both sides
  rows.sort((a, b) => a.rowNo - b.rowNo);
  const id = rows.findIndex(el => el.availableSeats === 0);


  // variable to check whether both sides of row are filled
  // before moving to next pair or rows
  let checkedRow = 'none';

  // variable to adjust the id of row depending upon "checkedRow" variable
  let counter = 0;

  // finally returned row to add seats
  let row;

  for (let i = 0; i < rows.length; i++) {
    if (checkedRow === 'previous' || checkedRow === 'next') {
      // if one side of row has completed previously
      // set counter to previous value again for other side of row
      counter--;
    }

    counter++;
    checkedRow === 'both' ? checkedRow = 'none' : '';


    if (!rows[id - counter] && !rows[id + counter]) {
      // if this is the only row available
      row = rows[id];

    } else if (!rows[id - counter] && rows[id + counter]) {
      // if this is first row
      row = rows[id + counter];

    } else if (rows[id - counter] && !rows[id + counter]) {
      // if this is last row
      row = rows[id - counter];

    } else if (rows[id - counter].availableSeats >= rows[id + counter].availableSeats &&
      checkedRow === 'none' ||
      checkedRow === 'next' )
     {
       // if previous row have more seats or next row was selected in previous loop
      row = rows[id - counter];

      if (checkedRow === 'none') {
        checkedRow = 'previous';
      } else {
        checkedRow = 'both';
      }

    } else {

      // if next row have more seats or previous row was selected in previous loop
      row = rows[id + counter];
      if (checkedRow === 'none') {
        checkedRow = 'next';
      } else {
        checkedRow = 'both';
      }

    }

    if (seatsReq === seatNoArr.length) {
      // when all the required seats are alloted, exit
      break;
    }

    // insert as many seats as possible in the selected row
    let newArr = await insertToSameRow(row, seatsReq - seatNoArr.length);

    // keep record of all the seat numbers being alloted
    seatNoArr = [...seatNoArr, ...newArr];
  }

  return seatNoArr;
}


// a helper function that will return an array of seat numbers
// for required seats and also adjust available seats
function getSeatNumberArr(row, seatsReq) {
  // seat number of first empty seat in a row
  let seatNo = (row.rowNo - 1) * 7 + row.totalSeats - row.availableSeats + 1;

  let arr;
  if (row.availableSeats < seatsReq) {
    // creating array using ES6 spread operator and
    // mapping each value acc to "seatNo" variable
    arr = [...Array(row.availableSeats).keys()].map(el => el + seatNo);
    row.availableSeats = 0;
  } else {
    arr = [...Array(seatsReq).keys()].map(el => el + seatNo);
    row.availableSeats = row.availableSeats - seatsReq;
  }
  return arr;
}


module.exports = router;
