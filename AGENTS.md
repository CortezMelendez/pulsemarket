# PulseMarket - Multi-Agent Architecture & Vibe Coding Guidelines

## Project Overview
PulseMarket is a high-performance e-commerce analytics dashboard built with Next.js 14 App Router, TypeScript, Tailwind CSS, Prisma ORM, Supabase PostgreSQL, and Vitest.

## AI Agent Roles & Collaboration
- **Architect Agent:** Designed database schema (`schema.prisma`) with indexes and soft-delete pattern (`deletedAt`).
- **Data Engineer Agent:** Built seed script (`prisma/seed.ts`) to inject 10,000+ relational records ensuring <400ms query performance.
- **Frontend / UX Agent:** Created responsive dashboard and Drag & Drop Kanban board using `@hello-pangea/dnd`.
- **QA & Testing Agent:** Implemented Vitest suite verifying business logic, financial metrics, and schema constraints.

## SLA & Performance Rules
- All queries must leverage Prisma indexes (`createdAt`, `status`, `userId`).
- Server Actions use `unstable_cache` for sub-400ms response time SLAs.
- Soft delete pattern strictly enforced (`deletedAt != null` filtering).