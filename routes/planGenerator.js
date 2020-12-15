const express = require('express');
const router = express.Router();
const data = require('../data');
const planGenerator = data.planGenerator;

router.get('/make_plan',async(req,res)=>{
    res.render('plan/setplan');
})

router.post('/generate_plan', async (req, res) => {
    try {
        let sourceNodeList = req.body.sourceNodeList;
        let plan = planGenerator.findLowestCostPlan(sourceNodeList);
        res.json({plan:plan});
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "service faild" });
    }
})