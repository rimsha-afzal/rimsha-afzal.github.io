# CV Structure

Keep `asset/cv/` as the shared source area only.

Recommended pattern:

- `asset/cv/main.tex` stays as the canonical default CV
- `asset/cv/config/` holds shared package and style setup
- create a temporary wrapper file outside `asset/cv/` when you need a job-specific PDF

For example, you can create a throwaway `cv-product.tex` or `cv-software.tex` at the repository root, compile it, and delete it when you are done. That keeps the shared CV folder clean and avoids storing multiple mains inside it.
