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
    let obj;
    let rowArr = [];
    for (let item of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
      if (item === 12) {
        obj = new Row({
          totalSeats: 3,
          rowNo: item,
          availableSeats: 3
        });
        rowArr.push(obj);
        continue;
      }

      obj = new Row({
        totalSeats: 7,
        rowNo: item,
        availableSeats: 7
      });
      rowArr.push(obj);
    }
    
    const result = await Row.insertMany(rowArr);

    res.status(200).json(result);
  } catch (error) {}
});

router.delete("", async (req, res) => {
  try {
    const result = await Row.deleteMany();
    res.status(200).json(result);
  } catch (error) {}
});

module.exports = router;
