# Local AI & Email Automation Architecture

This directory houses the **Private AI Infrastructure** and **Automated Email Outreach** features for Brand Growth OS. 

## **Architecture Overview**
This module is designed to be **modular** and **non-disruptive** to the core BGO project. It leverages the host-local Hippo/NemoClaw foundation.

### **Components (Future Implementation)**
- **`ollama.ts`**: The bridge to the local AI "Brain" (Llama 3.2).
- **`email_automation.ts`**: Business logic for generating and sending personalized emails.
- **`worker.ts`**: A dedicated background worker to process leads without blocking the main app.
- **`config.ts`**: Settings for the local AI and email automation.

## **Security & Privacy**
All processing in this folder is intended to run within a **NemoClaw Sandbox**, ensuring lead data and local resources are protected.
