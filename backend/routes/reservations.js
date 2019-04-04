const router = require("express")();

const Row = require("../models/row");

router.get("", async (req, res) => {
  try {
    const result = await Row.find();

    res.status(200).json(result);
  } catch (error) {}
});

router.post("", async (req, res) => {
  try {
    let result;
    const seatsReq = +req.body.seatsReq;
    let row = await Row.findOne({ availableSeats: seatsReq });
    if (row) {
      result = await insertToSameRow(row, seatsReq);
    } else {
      row = await Row.findOne({ availableSeats: { $gt: seatsReq } });

      console.log(row);
    }

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
});

router.delete("", async (req, res) => {
  try {
    await Row.updateMany({totalSeats: 7}, { $set: {availableSeats:  7}});
    const result = await Row.updateMany({totalSeats: 3}, {$set: { availableSeats:  3}});
    res.status(200).json(result);
  } catch (error) {}
});






// if same no. of seats are available in a row
async function insertToSameRow(row, seatsReq) {
  const rslt = await Row.findByIdAndUpdate(row._id, {
      $set: {
        availableSeats: row.availableSeats - seatsReq
      }},
    { new: true }
  );
  let seatNo = (row.rowNo - 1) * 7 + row.totalSeats - row.availableSeats + 1;
  return [...Array(seatsReq).keys()].map( v => v + seatNo);
}

module.exports = router;
