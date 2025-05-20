# Google Drive Clone

A feature-rich file storage web application built with Next.js, MongoDB, and Clerk Authentication that mimics core functionalities of Google Drive.

![Google Drive Clone](https://res.cloudinary.com/emmajoe/image/upload/v1747781629/Screenshot_2025-05-21_at_01.52.03_wc1grj.png)

## Features

- 🔐 User authentication with Clerk
- 📁 Create, browse, rename, and delete folders
- 📄 Upload, preview, rename, and delete files
- 🔍 Search functionality
- 📱 Responsive UI for desktop and mobile
- 📊 File/folder details panel
- 🌳 Folder navigation with breadcrumbs
- 💾 File uploads with progress indicator
- 🖼️ File preview for common file types
- ⚡ Context menu for quick actions

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: Clerk
- **File Storage**:Cloudinary
- **Deployment**: Vercel
- **Containerization**: Docker & Docker Compose

## Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Clerk account for authentication
- (Optional) Docker and Docker Compose for containerized setup

## Getting Started

### Environment Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/emmayusufu/googledriveclone.git
   cd googledriveclone
   ```

2. Create a `.env.local` file in the root directory with the following variables:

   ```
   # MongoDB
   MONGODB_URI=your_mongodb_connection_string

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key

   # Clerk Redirect URLs
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

   # Optional: For Docker setup
   MONGO_ROOT_USERNAME=admin
   MONGO_ROOT_PASSWORD=password

   # Optional: For Cloudinary (if you want to use instead of local storage)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

### Local Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the development server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Using Docker

1. Make sure Docker and Docker Compose are installed on your machine.

2. Create the `.env.local` file as mentioned above.

3. Start the containers:

   ```bash
   docker-compose up
   ```

4. The application will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
.
├── public/               # Static assets
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── api/         # API endpoints
│   │   ├── components/  # React components
│   │   ├── sign-in/     # Sign in page
│   │   ├── sign-up/     # Sign up page
│   │   └── page.tsx     # Main application page
│   ├── lib/             # Utility functions and services
│   ├── models/          # MongoDB schema models
│   └── middleware.ts    # Next.js middleware
├── docker-compose.yaml   # Docker Compose configuration
├── Dockerfile           # Docker configuration
└── next.config.ts       # Next.js configuration
```

## API Endpoints

- `GET /api/files` - Get all files or search files
- `POST /api/files` - Upload files
- `DELETE /api/files/:id` - Delete a file
- `GET /api/folders` - Get folders
- `POST /api/folders` - Create a folder
- `DELETE /api/folders/:id` - Delete a folder
- `GET /api/folders/:id/path` - Get folder path (for breadcrumbs)
- `GET /api/folders/tree` - Get folder tree (for sidebar)
- `POST /api/rename` - Rename a file or folder

## Acknowledgements

- [Next.js](https://nextjs.org/) - The React Framework
- [MongoDB](https://www.mongodb.com/) - NoSQL Database
- [Clerk](https://clerk.dev/) - Authentication and User Management
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Heroicons](https://heroicons.com/) - Beautiful hand-crafted SVG icons
