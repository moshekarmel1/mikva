function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function removeTime(date) {
    return new Date(new Date(date).setHours(0, 0, 0, 0));
}

function MikvaCalculation(date, beforeSunset, hefsekUpdate, pastFlows) {
    this.saw_blood = date;
    this.before_sunset = beforeSunset;
    this.hefsek = addDays(this.saw_blood, beforeSunset ? 4 : 5);
    this.mikva = addDays(this.hefsek, 7);
    this.day_30 = addDays(this.mikva, 18);
    this.day_31 = addDays(this.day_30, 1);
    //the hefsek tahara can be updated if necessary
    if (hefsekUpdate) {
        this.hefsek = new Date(hefsekUpdate);
        this.mikva = addDays(this.hefsek, 7);
    }
    var diffInDays;
    var lastFlow;
    if (pastFlows && pastFlows.length) {
        //assume last flow is the prior one
        lastFlow = pastFlows[pastFlows.length - 1];
        if (lastFlow && (removeTime(lastFlow.saw_blood) < removeTime(this.saw_blood))) {
            var diff = new Date(this.saw_blood).getTime() - new Date(lastFlow.saw_blood).getTime();
            diffInDays = diff / (24 * 60 * 60 * 1000);
            diffInDays = Math.round(figureOutDiff(lastFlow.before_sunset, this.before_sunset, diffInDays));
        }
    }
    if (diffInDays) {
        diffInDays++;
        var haflaga = new Date(this.saw_blood).setDate(new Date(this.saw_blood).getDate() + diffInDays);
        haflaga = new Date(haflaga);
        if (beforeSunset) haflaga.setDate(haflaga.getDate() - 1);
        this.haflaga = new Date(haflaga);
        this.diff_in_days = diffInDays;
    }
};

function figureOutDiff(previousBefore, currentBefore, diff) {
    if (previousBefore && !currentBefore) {
        diff++;
    }
    else if (!previousBefore && currentBefore) {
        diff--;
    }
    return diff;
}

module.exports = MikvaCalculation;
