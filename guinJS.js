// Mikail Usman
// Guinevere

import OpenAI from "openai";
import dotenv from 'dotenv';
import readline from 'readline';
import sqlite3 from 'sqlite3';

// General Variables
dotenv.config();
const apiKey = process.env.OPENAI_KEY;
const client = new OpenAI({apiKey:apiKey});
var running = true;
var count = 0;

// Bot Content
const botPersonality = '';
const exampleOutput = "";
const summaryPrompt = `Summarize the entire conversation you had right now in full detail 
  as if these are your own memories. Do it without saying your name and include anything you were told to remember, 
  or anything of significance to you or me. Exclude any reference to this message I'm telling you right now inside the summarisation.`;
var messageSet = [{"role":"system", "content":botPersonality},
              {"role":"assistant", "content":exampleOutput},];
var defaultSet = [{"role":"system", "content":botPersonality},
              {"role":"assistant", "content":exampleOutput},];

// Create an interface for user input and output
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const userInput = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

// Connect to Database || Create Database if it doesn't Exist
const db = new sqlite3.Database('memory.db', (err) => {
    if (err) {
        console.log(err.message);
    }
    else {
        console.log('Connected');
    }
})

// Create a table within the Database
// To ensure only one row exists, use a 'Primary Key'
db.run(`CREATE TABLE IF NOT EXISTS convoHistory (id INTEGER PRIMARY KEY, memories TEXT)`);

// Save updated memorySet to Database
const saveMemory = async () => {
  // REPLACE INTO: If id = 1 exists → delete it, then insert id = 1 with "new value"
  db.run(`INSERT OR REPLACE INTO convoHistory (id, memories) VALUES (?, ?)`, [1, JSON.stringify(messageSet)]);
}

// Load memories from Database, update messageSet with them
// SQL is async, so to prevent main() running before the data is loaded, we use callbacks
// Callback forces the program to wait until loadMemory() is done to execute main()
function loadMemory(callback) {
  db.get(`SELECT memories FROM convoHistory WHERE id = 1`, [], (err, row) => {
    if (row) {
      messageSet = JSON.parse(row.memories);
    }
    callback();
  });
}

// Query users [Read Data]
function readMemory() {
  db.all(`SELECT * FROM convoHistory`, [], (err, rows) => {
    if (err) {
      console.error('Error querying users:', err.message);
    } else {
      console.log('Data:');
      rows.forEach((row) => {
        console.log(row);
      });
    }
  });
}

// Reset Conversation History
const purgeDB = async () => {
  db.run(`DELETE FROM convoHistory`, (err) => {
    if (err) {
      console.log(err.message);
    }
    else {
      console.log('Success')
    }
  });

  // Insert the defaultSet (Convert JSON to string)
  db.run(`INSERT OR REPLACE INTO convoHistory (id, memories) VALUES (?, ?)`, [1, JSON.stringify(defaultSet)]);
}

// Summarize conversation history to manage context window
const summarizeMemories = async () => {
  messageSet.push({role: "user", content: summaryPrompt})
  const completion = await client.chat.completions.create({model: "gpt-4o-mini", messages:messageSet});
  const Summary = completion.choices[0].message.content;

  messageSet = defaultSet;
  messageSet.push({role: "assistant", content: Summary});
  await purgeDB();
  await saveMemory();
};

// Function that appends messageSet (memories) and handles GPT requests
const converse = async () => {
  const userPrompt = await userInput('>>> ');

  messageSet.push({role: "user", content: userPrompt})
  const completion = await client.chat.completions.create({model: "gpt-4o-mini", messages:messageSet});
  const botResponse = completion.choices[0].message.content;
  messageSet.push({role: "assistant", content: botResponse})

  saveMemory();

  return botResponse;
};

// Main program
const main = async() => {
  while (running == true){
      if (count == 10){
          await summarizeMemories();
          break;
      }
      else {
          count++;
          console.log(`(${count}) Guinevere: ${await converse()}`);
      }
  }
  rl.close(); // Close the readline interface
};

//purgeDB();
//readMemory();
//loadMemory(main);
