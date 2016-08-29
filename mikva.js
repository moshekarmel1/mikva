function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function MikvaCalculation(date, beforeSunset){
  this.sawBlood = date;
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
};

module.exports = MikvaCalculation;
