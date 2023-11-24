const MikvaCalculation = require('./mikva');

describe('MikvaCalculation', () => {
  test('it should calculate mikva dates correctly when no hefsek update and no past flows', () => {
    const date = '2023-01-01T05:00:00.000Z';
    const beforeSunset = false;
    const hefsekUpdate = null;
    const pastFlows = [];

    const mikvaCalculation = new MikvaCalculation(date, beforeSunset, hefsekUpdate, pastFlows);
    
    expect(mikvaCalculation.saw_blood).toEqual(new Date(date));
    expect(mikvaCalculation.before_sunset).toEqual(beforeSunset);
    expect(mikvaCalculation.hefsek).toEqual(new Date('2023-01-06T05:00:00.000Z')); // 5 days after date
    expect(mikvaCalculation.mikva).toEqual(new Date('2023-01-13T05:00:00.000Z')); // 7 days after hefsek
    expect(mikvaCalculation.day_30).toEqual(new Date('2023-01-31T05:00:00.000Z')); // 18 days after mikva
    expect(mikvaCalculation.day_31).toEqual(new Date('2023-02-01T05:00:00.000Z')); // 1 day after day_30
  });

  test('it should update hefsek and mikva dates when hefsekUpdate is provided', () => {
    const date = '2023-01-01T05:00:00.000Z';
    const beforeSunset = false;
    const hefsekUpdate = '2023-01-08T05:00:00.000Z';
    const pastFlows = [];

    const mikvaCalculation = new MikvaCalculation(date, beforeSunset, hefsekUpdate, pastFlows);

    expect(mikvaCalculation.hefsek).toEqual(new Date(hefsekUpdate));
    expect(mikvaCalculation.mikva).toEqual(new Date('2023-01-15T05:00:00.000Z')); // 7 days after updated hefsek
  });

  test('it should handle past flows and calculate haflaga and diff_in_days when after sunset', () => {
    const date = '2023-10-22T05:00:00.000Z';
    const beforeSunset = false;
    const hefsekUpdate = null;
    const pastFlows = [
      { saw_blood: '2023-09-25T04:00:00.000Z', before_sunset: true },
    ];

    const mikvaCalculation = new MikvaCalculation(date, beforeSunset, hefsekUpdate, pastFlows);
    expect(mikvaCalculation.haflaga).toEqual(new Date('2023-11-20T05:00:00.000Z')); // 30 days after last flow
    expect(mikvaCalculation.diff_in_days).toEqual(29); // difference between date and last flow
  });

  test('it should handle past flows and calculate haflaga and diff_in_days when before sunset', () => {
    const date = '2023-10-23T05:00:00.000Z';
    const beforeSunset = true;
    const hefsekUpdate = null;
    const pastFlows = [
      { saw_blood: '2023-09-25T04:00:00.000Z', before_sunset: true },
    ];

    const mikvaCalculation = new MikvaCalculation(date, beforeSunset, hefsekUpdate, pastFlows);

    expect(mikvaCalculation.haflaga).toEqual(new Date('2023-11-20T05:00:00.000Z')); // 30 days after last flow
    expect(mikvaCalculation.diff_in_days).toEqual(29); // difference between date and last flow
    expect(mikvaCalculation.yom_hachodesh).toEqual(new Date('2023-11-21T05:00:00.000Z')); // 30 days after last flow
  });

  test('it should handle past flows and calculate haflaga and diff_in_days when before sunset and previous was after sunset', () => {
    const date = '2023-10-23T05:00:00.000Z';
    const beforeSunset = true;
    const hefsekUpdate = null;
    const pastFlows = [
      { saw_blood: '2023-09-25T04:00:00.000Z', before_sunset: false },
    ];

    const mikvaCalculation = new MikvaCalculation(date, beforeSunset, hefsekUpdate, pastFlows);

    expect(mikvaCalculation.haflaga).toEqual(new Date('2023-11-19T05:00:00.000Z')); // 30 days after last flow
    expect(mikvaCalculation.diff_in_days).toEqual(28); // difference between date and last flow
  });
});
