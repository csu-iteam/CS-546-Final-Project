const express = require('express');
const router = express.Router();
const data = require('../data');
const planGenerator = data.planGenerator;

router.post('/generate_plan', async (req, res) => {
    try {
        let sourceNodeList = req.body.sourceNodeList;
        let plan = planGenerator.findLowestCostPlan(sourceNodeList);
        res.json(plan);
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "service faild" });
    }
})