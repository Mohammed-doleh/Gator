🐊 Gator — CLI RSS Feed Aggregator

Gator is a multi-user command-line RSS feed reader built with TypeScript, Node.js, PostgreSQL, and Drizzle ORM.

It allows users to:

Register and log in

Add RSS feeds

Follow / unfollow feeds

Aggregate feeds in the background

Store posts in a database

Browse posts directly in the terminal

🚀 Requirements

To run Gator locally, you need:

Node.js (v18+ recommended)

npm

PostgreSQL

A .env file with a valid database connection string

🛠 Installation
1️⃣ Clone the repository
git clone https://github.com/YOUR-USERNAME/gator.git
cd gator
2️⃣ Install dependencies
npm install
3️⃣ Setup Environment Variables

Create a .env file in the root of the project:

DATABASE_URL=postgres://username:password@localhost:5432/gator

Make sure the database exists before running migrations.

4️⃣ Run Database Migrations
npm run drizzle-kit generate
npm run drizzle-kit push
⚙️ Configuration

Gator uses a local config file to track the currently logged-in user.

The config file is automatically created when you register or log in.

No manual setup is required.

🧪 Running the CLI

All commands are run like this:

npm run start <command> [arguments]
📚 Available Commands
👤 User Commands
Register a new user
npm run start register <username>
Log in
npm run start login <username>
List users
npm run start users
📰 Feed Commands
Add a feed
npm run start addfeed "Feed Name" https://example.com/rss

This automatically follows the feed.

List all feeds
npm run start feeds
Follow a feed
npm run start follow https://example.com/rss
Unfollow a feed
npm run start unfollow https://example.com/rss
Show feeds you're following
npm run start following
🔄 Aggregator (Background Worker)

Start collecting feeds:

npm run start agg 30s

Examples:

agg 10s
agg 1m
agg 1h

The aggregator:

Fetches RSS feeds

Stores posts in the database

Runs continuously

Can be stopped with:

Ctrl + C
📖 Browse Posts

View the most recent posts from feeds you follow:

npm run start browse

By default, it shows 2 posts.

You can specify a limit:

npm run start browse 10

Posts are ordered from newest to oldest.

🧱 Tech Stack

TypeScript

Node.js

PostgreSQL

Drizzle ORM

RSS Parser

🗄 Database Structure
Users

Stores registered users.

Feeds

Stores RSS feeds added by users.

Feed Follows

Tracks which users follow which feeds.

Posts

Stores individual posts from RSS feeds.

Unique URL

Title

Description

Published date

Feed relationship

🔐 Design Highlights

Middleware-based authentication for commands

Background polling system using setInterval

Graceful shutdown handling

Duplicate post prevention

User-scoped browsing

Relational database design

🧠 Example Workflow
npm run start register mohammed
npm run start addfeed "Hacker News" https://news.ycombinator.com/rss
npm run start agg 30s

After letting it fetch:

npm run start browse 5
📌 Notes

Do not set the aggregator interval too low (e.g., 100ms).

Be respectful of third-party RSS servers.

Use reasonable intervals like 30s or 1m.

📄 License

This project is for educational purposes.

📎 GitHub Repository

After pushing your project to GitHub, your link should look like:

https://github.com/YOUR-USERNAME/gator
🧑‍💻 How to Push to GitHub

If you haven't pushed yet:

git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/gator.git
git push -u origin main
🎉 Congratulations

You built a fully functional multi-user RSS feed CLI with:

Authentication

Background worker

Database persistence

Feed management

Post browsing

This is real backend engineering work.
