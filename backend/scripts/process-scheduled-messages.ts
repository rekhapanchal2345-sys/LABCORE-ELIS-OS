import prisma from "../api/src/lib/prisma";
import { processScheduledMessages } from "../api/src/modules/communications/whatsapp-advanced.service";

async function main() {
  console.log("Processing scheduled WhatsApp messages...");
  
  try {
    const results = await processScheduledMessages();
    console.log(`Processed ${results.length} scheduled messages`);
    
    for (const result of results) {
      console.log(`Message ${result.id}: ${result.status}`);
    }
  } catch (error) {
    console.error("Error processing scheduled messages:", error);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log("Scheduled message processing completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });