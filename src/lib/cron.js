import cron from "node-cron";
import fetch from "node-fetch";

// Run every Monday at 9 AM
cron.schedule("0 9 * * 1", async () => {
  console.log("Checking for payment reminders...");
  try {
    const response = await fetch("http://localhost:3000/api/boxes/reminders",{
      headers: {
        'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
      },
    });
    const result = await response.json();
    console.log(result.message);
  } catch (error) {
    console.error("Cron error:", error);
  }
});

console.log("Cron job scheduled to check reminders every Monday at 9 AM.");