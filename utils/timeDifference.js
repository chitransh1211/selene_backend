import moment from "moment/moment.js";
export function calculateDifference(timestamp1, timestamp2) {
    const time1 = moment(timestamp1);
    const time2 = moment(timestamp2);
    
    if (!time1.isValid() || !time2.isValid()) {
      throw new Error('Invalid timestamp provided.');
    }
  
    const duration = moment.duration(time2.diff(time1));
  
    const difference = {
      milliseconds: duration.asMilliseconds(),
      seconds: duration.asSeconds(),
      minutes: duration.asMinutes(),
      hours: duration.asHours(),
      days: duration.asDays(),
      months: duration.asMonths(),
      years: duration.asYears(),
    };
  
    return difference;
  }
  
  // Example usage
  try {
    const timestamp1 = new Date('2024-07-24T10:00:00Z');
    const timestamp2 = new Date('2024-07-23T08:00:00Z');
    const diff = calculateDifference(timestamp1, timestamp2);
    console.log(diff);
  } catch (error) {
    console.error(error.message);
  }