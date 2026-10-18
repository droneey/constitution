```mermaid
flowchart LR
  web[Web server] -->|imports| jobs[shared/jobs]
  worker[Worker] -->|imports| jobs
```
