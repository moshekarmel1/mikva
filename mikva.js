function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function removeTime(date){
    return new Date(new Date(date).setHours(0,0,0,0));
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
        //assume last flow is the prior one
        var lastFlow = pastFlows[pastFlows.length - 1];
        if(lastFlow && (removeTime(lastFlow.sawBlood) < removeTime(this.sawBlood))){
            var diff = new Date(this.sawBlood).getTime() - new Date(lastFlow.sawBlood).getTime();
            diffInDays = diff / (24 * 60 * 60 * 1000);
            diffInDays = Math.round(figureOutDiff(lastFlow.beforeSunset, this.beforeSunset, diffInDays));
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
