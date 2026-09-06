<img width="1280" height="640" alt="git (1)" src="https://github.com/user-attachments/assets/8920b256-2ba8-4988-b824-5351134eb4bd" />



Team Name: Medellin

Team Members
Team Lead: Deon K S - SCMS School of Engineering and Technology

Member 2: Gauthamkrishna S - SCMS School of Engineering and Technology

Project Description
Kandamkali UNO is an unfair, chaotic multiplayer card game that takes standard UNO and hands total control to D.A.V.I—an unhinged AI referee. After every single move, the AI dishes out arbitrary buffs or devastating nerfs accompanied by iconic Malayalam pop-culture roasts and audio soundbites, ruining friendships in real time.

The Problem (that doesn't exist)
Standard UNO allows players to win using skill, strategy, and card-counting. This creates a dangerous level of peace and harmony among friends, completely ruining the core purpose of card games: pure, unfiltered emotional trauma and screaming matches over a +4 card.

The Solution (that nobody asked for)
We built an authoritarian, deeply biased digital referee called D.A.V.I. Every time a card is played, the AI randomly intervenes—taxing the leader with extra cards, shuffling hands clockwise, revoking UNO declarations, or abruptly changing card colors—all while mocking the victims with Malayalam movie dialogue audio chips and a real-time reactive soundboard.

Technical Details
Technologies/Components Used
For Software:

Languages used: JavaScript (ES6+), JSX, HTML5, CSS3

Frameworks used: React 18

Libraries used: Tailwind CSS, Lucide React, Firebase SDK (firebase/database)

Tools used: Vite, Firebase Console (Realtime Database & Hosting), VS Code / Cursor AI, Git/GitHub

For Hardware:

N/A (Pure Software Application)

Implementation
For Software:
Installation

Bash
# Clone the repository
git clone https://github.com/Deon-KS/kandamkali-uno.git

# Navigate into project directory
cd kandamkali-uno

# Install all dependencies
npm install
Run

Bash
# Start local development server with Vite HMR
npm run dev

# Build for production deployment
npm run build
Project Documentation
For Software:
Screenshots

![Lobby View](assets/screenshots/lobby.png)

Caption: Neo-brutalist arcade lobby featuring the 6-character room generator, multiplayer code entry, and offline bot practice mode.

![Game Arena & Active Play](assets/screenshots/gameboard.png)

Caption: Main table viewport showing active play, opponent card rails, player hand fan-out, and the animated turn indicator.

![D.A.V.I Intervention & Meme Soundboard](assets/screenshots/ai-chaos-sidebar.png)

Caption: Slide-down Chaos Alert banner triggering a hand swap alongside the sidebar chat feed with interactive Malayalam dialogue audio chips.

Diagrams

![System Workflow](assets/diagrams/workflow.png)

Caption: System architecture showing client-side game engine dispatching turn states to Firebase RTDB with sub-50ms sync, while the D.A.V.I engine mutates hands and triggers the client-side Web Audio pipeline.

Additional Demos

Live Web App: (https://kandam-kali.vercel.app/) 

GitHub Repository: https://github.com/Deon-KS/kandamkali-uno

Team Contributions
Deon K S: Core card game state engine, Firebase Realtime Database schema and sync logic, and D.A.V.I chaos modifier algorithms.
          Frontend UI layout in React & Tailwind CSS, neo-brutalist card styling, responsive mobile drawer, and lobby room code management.

Gauthamkrishna S: Audio pipeline integration (AudioManager.js), Malayalam meme soundbite curation and clipping, and automated offline bot logic



