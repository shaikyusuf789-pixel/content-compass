I will implement the Script Generator page (Phase 3) as requested, porting the functionality from the provided Python/Streamlit repository to the existing React/TanStack Router application.

### Design and Architecture
-   **Page Name**: `Script Generator` (Path: `/script-generator`)
-   **Navigation**: Add a link to the new page in the dashboard sidebar.
-   **Structure**: A two-column layout mirroring the Streamlit version.
    -   **Left Column**: Input configuration (Video Type, Input Mode, Word Count, Special Instructions, Generate Button).
    -   **Right Column**: Preview and editing of generated script segments, with regeneration options.
-   **Styling**: Use Tailwind CSS and Shadcn UI components (Card, Tabs, Input, Textarea, Button, Badge) to replicate the professional look while maintaining consistency with the current app.
-   **Logic**:
    -   Port prompt templates (`TELUGU_TTS_MASTER_PROMPT`, `_SYSTEM_TOPIC`, etc.) into a dedicated constants file.
    -   Implement the logic for "Topic", "Multi-Transcript", and "PDF" input modes.
    -   Include the "SEO Pack" and "Handout Generator" functionality as requested, while removing "Thumbnail Generator" and its related segments as per instructions.
    -   Support multiple AI models (OpenAI o3/o1/4o, Claude 3.5 Sonnet, Gemini 1.5/2.0 Pro/Flash) via the existing AI Gateway.

### Technical Steps
1.  **Constants & Prompts**: Create `src/lib/script-generator-prompts.ts` to store all the complex prompt templates and business rules (Telugu Unicode script, 150-180 word chunks, etc.).
2.  **State Management**: Use React state and/or TanStack Query to manage the input parameters and generated script content.
3.  **New Route**: Create `src/routes/_dashboard.script-generator.tsx` for the main page component.
4.  **UI Components**:
    -   `ScriptConfigForm`: Left-side controls for video type, input mode, and word count.
    -   `ScriptPreview`: Right-side tabs for viewing and editing segments.
    -   `SEOSection`: Component for generating YouTube titles and tags.
    -   `HandoutGenerator`: Implementation of the AI Handout logic (English only).
5.  **AI Integration**: Implement a server-side function (or edge function if needed) to handle the multi-model script generation, ensuring it uses the OpenAI 4o model as the primary request and supports others.
6.  **Sidebar Update**: Add the "Script Generator" link to `src/routes/_dashboard.tsx`.

### Model Support
-   **OpenAI**: GPT-4o, o1, o3-mini.
-   **Claude**: Sonnet 3.5 (mapped to Poe's 4.6 as per user request).
-   **Gemini**: 1.5 Pro, 2.0 Flash.

### Removed Features (as per request)
-   Thumbnail Generator.
-   Handout Generator (wait, the user said "remove those two segments: THUMBNAIL GENERATOR, HANDOUT GENERATOR" - I will re-read the prompt).
    -   User: "Important note: there is THUMBNAIL GENERATOR, HANDOUT GENERATOR in this shared git, leave it, keep remaining asitis and remove those two segments."
    -   Clarification: I will remove BOTH Thumbnail and Handout generators from the final page.
