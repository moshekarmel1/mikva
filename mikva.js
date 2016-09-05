function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function MikvaCalculation(date, beforeSunset, hefsekUpdate, pastFlows){
    this.sawBlood = date;
    this.beforeSunset = beforeSunset;
    if(beforeSunset){
        this.hefsek = addDays(this.sawBlood, 4);
        this.mikva = addDays(this.hefsek, 7);
        this.day30 = addDays(this.mikva, 18);
    }else{
        this.hefsek = addDays(this.sawBlood, 5);
        this.mikva = addDays(this.hefsek, 7);
        this.day30 = addDays(this.mikva, 17);
    }
    this.day31 = addDays(this.day30, 1);
    //the hefsek tahra can be updated if necessary
    if(hefsekUpdate){
        this.hefsek = new Date(hefsekUpdate);
        this.mikva = addDays(this.hefsek, 7);
    }
    var diffInDays;
    if(pastFlows && pastFlows.length){
        /*var lastFlow = pastFlows.reduce(function(flow, newFlow){
            return new Date(flow.sawBlood) > new Date(newFlow.sawBlood);
        }, {});*/
        //assume last flow is the prior one
        var lastFlow = pastFlows[pastFlows.length - 1];
        console.log(lastFlow);
        if(lastFlow){//} && (new Date(lastFlow.sawBlood) < this.sawBlood)){
            var diff = new Date(this.sawBlood).getTime() - new Date(lastFlow.sawBlood).getTime();
            console.log("diff", diff);
            diffInDays = diff / (24 * 60 * 60 * 1000);
            diffInDays = figureOutDiff(lastFlow.beforeSunset, this.beforeSunset, diffInDays);
            console.log("diffInDays", diffInDays);
        }
    }
    if(diffInDays){
        this.haflaga = new Date(this.sawBlood).setDate(new Date(this.sawBlood).getDate() + diffInDays);
        this.diffInDays = diffInDays + 1;
    }
};

function figureOutDiff(previousBefore, currentBefore, diff){
    if(previousBefore && !currentBefore){
        diff += 1;
    }
    else if(!previousBefore && currentBefore){
        diff -= 1;
    }
    return diff;
}

module.exports = MikvaCalculation;
