function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function removeTime(date){
    return new Date(new Date(date).setHours(0,0,0,0));
}

function MikvaCalculation(date, beforeSunset, hefsekUpdate, pastFlows){
    this.saw_blood = date;
    this.before_sunset = beforeSunset;
    if(beforeSunset){
        this.hefsek = addDays(this.saw_blood, 4);
        this.mikva = addDays(this.hefsek, 7);
        this.day_30 = addDays(this.mikva, 18);
    }else{
        this.hefsek = addDays(this.saw_blood, 5);
        this.mikva = addDays(this.hefsek, 7);
        this.day_30 = addDays(this.mikva, 17);
    }
    this.day_31 = addDays(this.day_30, 1);
    //the hefsek tahra can be updated if necessary
    if(hefsekUpdate){
        this.hefsek = new Date(hefsekUpdate);
        this.mikva = addDays(this.hefsek, 7);
    }
    var diffInDays;
    if(pastFlows && pastFlows.length){
        //assume last flow is the prior one
        var lastFlow = pastFlows[pastFlows.length - 1];
        if(lastFlow && (removeTime(lastFlow.saw_blood) < removeTime(this.saw_blood))){
            var diff = new Date(this.saw_blood).getTime() - new Date(lastFlow.saw_blood).getTime();
            diffInDays = diff / (24 * 60 * 60 * 1000);
            diffInDays = Math.round(figureOutDiff(lastFlow.before_sunset, this.before_sunset, diffInDays));
        }
    }
    if(diffInDays){
        var haflaga = new Date(this.saw_blood).setDate(new Date(this.saw_blood).getDate() + diffInDays);
        this.haflaga = new Date(haflaga);
        this.diff_in_days = diffInDays + 1;
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
