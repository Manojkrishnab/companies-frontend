# Companies UI (Frontend)

## Tech Stack
- React (Vite)
- Axios (API calls)
- React Hook Form + Yup (form validation)
- SweetAlert2 (delete confirmation)
- Bootstrap 5 (UI styling)

## Setup
- Clone the repo and navigate to the `frontend/` folder
- Install dependencies:
  ```bash
  npm install

# To Start the app:
- npm run dev

## Available Functionalities

-  **Company List** – Display companies in a responsive Bootstrap table
-  **Filters** – Filter companies by:
  - Industry (dynamic from backend data)
  - City (dynamic from backend data)
  - Search (by name,industry etc., debounced input)
-  **Sorting** – Clickable table headers to sort by:
  - Name
  - Industry
  - City
  - Employee Size
  - Established Date
-  **Pagination** – Server-side pagination with Bootstrap pagination controls
-  **Add Company** – Add a new company using a Bootstrap modal form with `react-hook-form + yup` validation
-  **Update Company** – Edit an existing company in a modal form with pre-filled data and validation
-  **Delete Company** – Delete company with SweetAlert2 confirmation prompt
-  **Responsive Design** – Mobile-friendly layout with scrollable table, stacked filters, and adaptive pagination
