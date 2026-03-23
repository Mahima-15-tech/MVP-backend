const SubscriptionHistory = require("../../models/SubscriptionHistory");

const COMMISSION = 0.15;

const PLAN_PRICE = {
  MONTHLY: 8,
  YEARLY: 50,
  TOPUP: 3,
  TRIAL: 0
};

exports.getRevenue = async (req,res)=>{
try{

const {month,from,to} = req.query;

let startDate;
let endDate;

const now = new Date();

/* ================= MONTH FILTER ================= */

if(month==="THIS_MONTH"){
startDate = new Date(now.getFullYear(),now.getMonth(),1);
}

if(month==="LAST_MONTH"){
startDate = new Date(now.getFullYear(),now.getMonth()-1,1);
endDate = new Date(now.getFullYear(),now.getMonth(),0);
}

if(month==="LAST_3"){
startDate = new Date(now.getFullYear(),now.getMonth()-3,1);
}

if(month==="YTD"){
startDate = new Date(now.getFullYear(),0,1);
}

if(month==="ALL"){
startDate = null;
endDate = null;
}

/* ================= DATE RANGE ================= */

// ADD THIS
if(month === "CUSTOM"){
  startDate = null;
  endDate = null;
  }

  if(from && to){
    startDate = new Date(from);
    
    endDate = new Date(to);
    endDate.setHours(23,59,59,999); // 🔥 IMPORTANT FIX
    }

/* ================= MATCH ================= */

const match = {};

if(startDate){
match.createdAt = {$gte:startDate};
}

if(endDate){
match.createdAt = {
...match.createdAt,
$lte:endDate
};
}

/* ================= AGGREGATE ================= */

const records = await SubscriptionHistory.aggregate([

{$match:match},

{
$lookup:{
from:"users",
localField:"userId",
foreignField:"_id",
as:"user"
}
},

{$unwind:"$user"},

{
$project:{
date:"$createdAt",
userId:"$user.phone",
userName:"$user.name",
plan:"$newPlan"
}
},

{$sort:{date:-1}}

]);

/* ================= REVENUE CALC ================= */

const revenue = records.map(r=>{

const gross = PLAN_PRICE[r.plan] || 0;

const net = +(gross * (1 - COMMISSION)).toFixed(2);

return{
...r,
gross,
net
};

});

res.json(revenue);

}catch(err){
res.status(500).json({message:err.message});
}
};




exports.getRevenueData = async () => {

  const records = await SubscriptionHistory.find();

  let monthlyGross = 0;
  let yearlyGross = 0;
  let topupGross = 0;

  records.forEach(r => {
    if (r.newPlan === "MONTHLY") monthlyGross += 8;
    if (r.newPlan === "YEARLY") yearlyGross += 50;
    if (r.newPlan === "TOPUP") topupGross += 3;
  });

  return {
    monthly: {
      gross: monthlyGross,
      net: +(monthlyGross * (1 - COMMISSION)).toFixed(2)
    },
    yearly: {
      gross: yearlyGross,
      net: +(yearlyGross * (1 - COMMISSION)).toFixed(2)
    },
    topups: {
      gross: topupGross,
      net: +(topupGross * (1 - COMMISSION)).toFixed(2)
    }
  };
};