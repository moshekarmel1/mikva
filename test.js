const MikvaCalculation = require('./mikva');

const removeTime = date => date.toISOString().split('T')[0];

describe('MikvaCalculation', () => {
  test('it should calculate mikva dates correctly when no hefsek update and no past flows', () => {
    const date = new Date('2023-01-01');
    const beforeSunset = false;
    const hefsekUpdate = null;
    const pastFlows = [];

    const mikvaCalculation = new MikvaCalculation(date, beforeSunset, hefsekUpdate, pastFlows);

    expect(mikvaCalculation.saw_blood).toEqual(date);
    expect(mikvaCalculation.before_sunset).toEqual(beforeSunset);
    expect(mikvaCalculation.hefsek).toEqual(new Date('2023-01-06')); // 5 days after date
    expect(mikvaCalculation.mikva).toEqual(new Date('2023-01-13')); // 7 days after hefsek
    expect(mikvaCalculation.day_30).toEqual(new Date('2023-01-31')); // 18 days after mikva
    expect(mikvaCalculation.day_31).toEqual(new Date('2023-02-01')); // 1 day after day_30
  });

  test('it should update hefsek and mikva dates when hefsekUpdate is provided', () => {
    const date = new Date('2023-01-01');
    const beforeSunset = false;
    const hefsekUpdate = '2023-01-08';
    const pastFlows = [];

    const mikvaCalculation = new MikvaCalculation(date, beforeSunset, hefsekUpdate, pastFlows);

    expect(mikvaCalculation.hefsek).toEqual(new Date(hefsekUpdate));
    expect(mikvaCalculation.mikva).toEqual(new Date('2023-01-15')); // 7 days after updated hefsek
  });

  test('it should handle past flows and calculate haflaga and diff_in_days when after sunset', () => {
    const date = new Date('2023-10-22');
    const beforeSunset = false;
    const hefsekUpdate = null;
    const pastFlows = [
      { saw_blood: '2023-09-25', before_sunset: true },
    ];

    const mikvaCalculation = new MikvaCalculation(date, beforeSunset, hefsekUpdate, pastFlows);
    expect(removeTime(mikvaCalculation.haflaga)).toEqual(removeTime(new Date('2023-11-20'))); // 30 days after last flow
    expect(mikvaCalculation.diff_in_days).toEqual(29); // difference between date and last flow
  });

  test('it should handle past flows and calculate haflaga and diff_in_days when before sunset', () => {
    const date = new Date('2023-10-23');
    const beforeSunset = true;
    const hefsekUpdate = null;
    const pastFlows = [
      { saw_blood: '2023-09-25', before_sunset: true },
    ];

    const mikvaCalculation = new MikvaCalculation(date, beforeSunset, hefsekUpdate, pastFlows);

    expect(removeTime(mikvaCalculation.haflaga)).toEqual(removeTime(new Date('2023-11-20'))); // 30 days after last flow
    expect(mikvaCalculation.diff_in_days).toEqual(29); // difference between date and last flow
  });

  test('it should handle past flows and calculate haflaga and diff_in_days when before sunset and previous was after sunset', () => {
    const date = new Date('2023-10-23');
    const beforeSunset = true;
    const hefsekUpdate = null;
    const pastFlows = [
      { saw_blood: '2023-09-25', before_sunset: false },
    ];

    const mikvaCalculation = new MikvaCalculation(date, beforeSunset, hefsekUpdate, pastFlows);

    expect(removeTime(mikvaCalculation.haflaga)).toEqual(removeTime(new Date('2023-11-19'))); // 30 days after last flow
    expect(mikvaCalculation.diff_in_days).toEqual(28); // difference between date and last flow
  });
});
