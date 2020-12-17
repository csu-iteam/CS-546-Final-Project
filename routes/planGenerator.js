const express = require('express');
const router = express.Router();
const data = require('../data');
const planGenerator = data.planGenerator;

router.get('/make_plan', async (req, res) => {
    // res.getHeaders('Access-Control-Allow-Origin:*');
    // res.addHeader('Access-Control-Allow-Method:POST,GET');
    //  res.setHeader('Access-Control-Allow-Origin','*');
    //  res.setHeader('Access-Control-Allow-Method','GET');
    //console.log(res);
    res.render('plan/setPlan');
})

router.post('/generate_plan', async (req, res) => {
    try {
        //console.log(req.body);
        let sourceNodeList = JSON.parse(req.body.data);
        let plan = await planGenerator.findLowestCostPlan(sourceNodeList);
        res.json({plan:plan});
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "service faild" });
    }
})

router.get('/getPlace/:searchTerm', async (req, res) => {
    try {
        let result = await planGenerator.getPoi(req.params.searchTerm);
        res.json(result);
    } catch (e) {
        console.log(e);
        res.status(500);
    }
})

let dataRecievedByRecommend = [];
router.post('/addPlaceFromRecommend', async (req, res) => {
    let theData = req.body.thisPlaceData;
    res.json(theData);
    dataRecievedByRecommend.push(theData);
    console.log(dataRecievedByRecommend)
})

module.exports = router;