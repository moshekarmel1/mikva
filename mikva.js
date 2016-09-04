function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function MikvaCalculation(date, beforeSunset, hefsekUpdate){
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
};

module.exports = MikvaCalculation;
