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

// Create New Database 
const db = new sqlite3.Database('memory.db', (err) => {
    if (err) {
        console.log(err.message);
    }
    else {
        console.log('Success');
    }
})

// Bot Content
const botPersonality = '';
const exampleOutput = "";
var messageSet = [{"role":"system", "content":botPersonality},
              {"role":"assistant", "content":exampleOutput},]

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

// Function that appends messageSet (memories) and handles GPT requests
const converse = async () => {
    const userPrompt = await userInput('>>> ');

    messageSet.push({role: "user", content: userPrompt})
    const completion = await client.chat.completions.create({model: "gpt-4o-mini", messages:messageSet});
    const botResponse = completion.choices[0].message.content;
    return botResponse;
};

// Main program
const main = async() => {
    while (running == true){
        if (count == 10){
            break;
        }
        else {
            count++;
            console.log(`(${count}) Guinevere: ${await converse()}`);
        }
    }
    rl.close(); // Close the readline interface
}

main()