# 🏋️‍♂️ Personal Trainer A.I.

> An adaptive, guilt-free AI fitness and nutrition coach that dynamically adjusts to real human behavior—seamlessly adapting to laziness, missing ingredients, or impromptu cheat days without guilt-tripping the user.

## 🌟 Overview
Most fitness apps fail because they are too rigid, leading to burnout and guilt when users miss a day. **Personal Trainer A.I.** bridges the gap between strict goal-setting and real life. It acts as a supportive coach rather than a strict drill sergeant, recalibrating schedules, workouts, and meal plans dynamically in the background.

## ✨ Core Features

### 📅 1. Smart Tracking & "The Checkerboard"
*   **Adaptive Scheduling:** Users input their baseline routine into a visual "checkerboard." Missed a leg day? The AI dynamically reschedules and blends missed workouts into future routines instead of showing a failed red 'X'.
*   **Guilt-Free Cheat Days:** If you skip a workout or eat fast food, the AI silently recalibrates your upcoming meals and workouts to offset the cheat day without making you feel overwhelmed.

### 🏃 2. Context-Aware Workout Coaching
*   **At-Home Trainer:** Too unmotivated to leave the house? The AI generates quick 15-minute workouts utilizing standard household items (e.g., using a chair for tricep dips).
*   **Gym Trainer & Location Routing:** Recommends nearby fitness facilities, displaying travel times, prices, and available equipment.
*   **Smart Cardio Mapping:** Generates custom running routes based on your available time (e.g., a perfect 20-minute loop ending exactly at your front door).

### 🥗 3. AI Meal Planning & Pantry Tracking
*   **Receipt Scanning:** Snap a picture of your grocery receipt or fridge. The AI logs ingredients and available seasonings into a digital inventory.
*   **Resourceful Recipes:** Recommends meals based *only* on what you currently own. It tracks ingredient usage and sends reminders to prevent food waste.
*   **Fast-Food Compensation:** Calculates the caloric/nutritional impact of an unplanned fast-food meal and automatically lightens up the following days to keep you on track.

### 🎙️ 4. Accessibility & Voice Interaction
*   **Hands-Free Mode:** Integrated Speech-to-Text and Text-to-Speech. Ask the AI questions while cooking ("How much seasoning do I add?") and get verbal responses.
*   **Multilingual Support:** Interacts and translates instructions into users' native languages, making fitness accessible to all communities.

## 🚀 Roadmap (Upcoming)
- [ ] Phase 1: Develop the core logic for the adaptive "Checkerboard" scheduling algorithm.
- [ ] Phase 2: Build the OCR/Vision mechanics for grocery-receipt scanning and pantry tracking.
- [ ] Phase 3: Integrate Maps API for Gym routing and Smart Cardio loops.
- [ ] Phase 4: Implement future monetization streams (Gym partnerships and referral programs).

- [ ] Install Ollama from ollama.com.

  Pull the required model in their terminal (e.g., ollama pull llama3 or ollama pull mistral).

  Ensure Ollama is running in the background before starting the FastAPI backend.

---
*Built to make fitness adapt to you, not the other way around.*
