// notification.js
const cron = require("node-cron");
const Reminder = require("./models/reminder"); // Import the reminder model

// Define a function for sending a notification
const sendNotification = (reminder) => {
  // Get the user and the reminder details
  const { user, type, name, date, interval, dose } = reminder;

  // Create a message based on the type of the reminder
  let message;
  if (type === "Medicine") {
    message = `Hey ${user.name}, it's time to take ${dose} ${name}.`;
  } else if (type === "Doctor") {
    message = `Hey ${user.name}, you have an appointment with ${name} at ${date.toLocaleTimeString()}.`;
  }

  // Send the message to the user (for example, using email or push notification)
  console.log(message); // For demonstration purposes only
};

// Create a cron job that runs every minute
cron.schedule("* * * * *", async () => {
  try {
    // Get the current date and time
    const now = new Date();

    // Find all the reminders that are due
    const reminders = await Reminder.find({
      date: { $lte: now }, // The reminder date is less than or equal to the current date
    });

    // Loop through the reminders and send a notification for each one
    for (let reminder of reminders) {
      sendNotification(reminder);

      // Update the reminder date based on the interval (if any)
      if (reminder.interval > 0) {
        reminder.date.setDate(reminder.date.getDate() + reminder.interval);
        await reminder.save();
      } else {
        // Delete the reminder if it is a one-time reminder
        await reminder.remove();
      }
    }
  } catch (error) {
    // Handle any errors
    console.error(error);
  }
});

// Export the function
module.exports = sendNotification;
