
import React, { useState } from 'react';
import { 
  Cloud, 
  GitBranch, 
  Eye, 
  Shield, 
  Box, 
  Server, 
  Zap,
  Terminal,
  FileCode,
  Activity,
  Layers,
  Lock,
  GitMerge,
  Database
} from 'lucide-react';

const TERRAFORM_CODE = `
# AWS Fargate Cluster for PromoSpider
resource "aws_ecs_cluster" "promo_cluster" {
  name = "promo-spider-cluster-prod"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# Task Definition (The Scraper Agent)
resource "aws_ecs_task_definition" "scraper" {
  family                   = "promo-scraper"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 2048 # 2 vCPU
  memory                   = 4096 # 4 GB
  
  container_definitions = jsonencode([
    {
      name  = "scraper-worker"
      image = "\${aws_ecr_repository.scraper.repository_url}:latest"
      environment = [
        { name = "REDIS_URL", value = var.redis_url },
        { name = "PROXY_POOL", value = var.proxy_pool_secret }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group" = "/ecs/promo-scraper"
          "awslogs-region" = "us-east-1"
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

# Auto Scaling Target
resource "aws_appautoscaling_target" "scraper_target" {
  max_capacity       = 50
  min_capacity       = 2
  resource_id        = "service/\${aws_ecs_cluster.promo_cluster.name}/\${aws_ecs_service.scraper.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}
`.trim();

const GITHUB_ACTIONS_CODE = `
name: PromoSpider CI/CD

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install Dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-asyncio
          
      - name: Run Unit Tests
        run: pytest tests/unit/
        
      - name: Run Integration Tests (Sandbox)
        env:
          TEST_MODE: "true"
        run: pytest tests/integration/

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Login to ECR
        uses: aws-actions/amazon-ecr-login@v1
        
      - name: Build and Push Docker Image
        run: |
          docker build -t promo-spider-api .
          docker tag promo-spider-api:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/promo-api:latest
          docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/promo-api:latest

  deploy-canary:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to ECS (Canary 10%)
        run: |
          aws ecs update-service --cluster promo-cluster --service promo-api --force-new-deployment
`.trim();

const DeploymentArchitecture: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'INFRA' | 'CICD' | 'OBSERVE' | 'STRATEGY'>('INFRA');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const CodeBlock = ({ code }: { code: string }) => (
    <div className="relative group mt-4">
      <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => handleCopy(code)}
          className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-lg text-xs flex items-center gap-2"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="bg-slate-950 p-6 rounded-xl border border-slate-800 overflow-x-auto text-sm font-mono text-slate-300 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-center flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Cloud className="w-6 h-6 text-indigo-500" /> DevOps & Deployment
          </h2>
          <p className="text-slate-400">Infrastructure as Code, CI/CD Pipelines, and Reliability Engineering.</p>
        </div>
        
        <div className="flex gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button onClick={() => setActiveTab('INFRA')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'INFRA' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Infrastructure</button>
          <button onClick={() => setActiveTab('CICD')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'CICD' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>CI/CD</button>
          <button onClick={() => setActiveTab('OBSERVE')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'OBSERVE' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Observability</button>
          <button onClick={() => setActiveTab('STRATEGY')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'STRATEGY' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Release Strategy</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin pb-20">

        {/* INFRA TAB */}
        {activeTab === 'INFRA' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Box className="w-5 h-5 text-indigo-400" /> Container Orchestration
                  </h3>
                  <p className="text-sm text-slate-400 mb-4">
                    We use AWS Fargate (Serverless Containers) for the worker pool to allow effortless horizontal scaling based on Queue Depth.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>Zero infrastructure management (No EC2 patching)</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>Auto-scaling triggers via CloudWatch Alarms</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>Spot Instances for Scrapers (60% cost savings)</li>
                  </ul>
               </div>

               <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-400" /> Managed Data Layer
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-slate-900 p-3 rounded border border-slate-700">
                       <span className="text-sm text-slate-300">Primary DB</span>
                       <span className="text-xs font-mono text-emerald-400">AWS RDS (Postgres 15)</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900 p-3 rounded border border-slate-700">
                       <span className="text-sm text-slate-300">Message Queue</span>
                       <span className="text-xs font-mono text-rose-400">AWS ElastiCache (Redis)</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900 p-3 rounded border border-slate-700">
                       <span className="text-sm text-slate-300">Blob Storage</span>
                       <span className="text-xs font-mono text-amber-400">AWS S3 (Standard IA)</span>
                    </div>
                  </div>
               </div>
            </div>

            <div>
               <h3 className="text-sm font-bold text-slate-500 uppercase mb-2">Terraform Blueprint (AWS)</h3>
               <CodeBlock code={TERRAFORM_CODE} />
            </div>
          </div>
        )}

        {/* CI/CD TAB */}
        {activeTab === 'CICD' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                 <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                   <Terminal className="w-5 h-5 text-purple-400" /> Unit Testing
                 </h3>
                 <p className="text-xs text-slate-400">Runs on every commit.</p>
                 <div className="mt-3 space-y-1 text-xs text-slate-300">
                   <div>✅ Deduplication Logic</div>
                   <div>✅ Prompt Schema Check</div>
                   <div>✅ URL Normalization</div>
                 </div>
               </div>

               <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                 <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                   <Layers className="w-5 h-5 text-blue-400" /> Integration Testing
                 </h3>
                 <p className="text-xs text-slate-400">Runs on PR merge.</p>
                 <div className="mt-3 space-y-1 text-xs text-slate-300">
                   <div>✅ Full Headless Scrape (Sandbox)</div>
                   <div>✅ DB Migration Revert Test</div>
                   <div>✅ API Endpoint Latency</div>
                 </div>
               </div>

               <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                 <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                   <Lock className="w-5 h-5 text-emerald-400" /> Secrets
                 </h3>
                 <p className="text-xs text-slate-400">Injected at runtime.</p>
                 <div className="mt-3 space-y-1 text-xs text-slate-300">
                   <div>🔒 AWS Systems Manager</div>
                   <div>🔒 GitHub Encrypted Secrets</div>
                   <div>🔒 No .env files in Docker</div>
                 </div>
               </div>
            </div>

            <div>
               <h3 className="text-sm font-bold text-slate-500 uppercase mb-2">GitHub Actions Pipeline</h3>
               <CodeBlock code={GITHUB_ACTIONS_CODE} />
            </div>
          </div>
        )}

        {/* OBSERVABILITY TAB */}
        {activeTab === 'OBSERVE' && (
          <div className="space-y-6">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                   <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                     <Activity className="w-5 h-5 text-amber-500" /> Prometheus Metrics
                   </h3>
                   <p className="text-sm text-slate-400 mb-4">
                     We expose a `/metrics` endpoint on all services for scraping.
                   </p>
                   <div className="bg-slate-950 p-4 rounded border border-slate-800 font-mono text-xs text-amber-200">
                     # HELP scraper_jobs_total Total offers scraped<br/>
                     # TYPE scraper_jobs_total counter<br/>
                     scraper_jobs_total{`{source="impact"}`} 1402<br/>
                     <br/>
                     # HELP active_browsers Number of headless instances<br/>
                     # TYPE active_browsers gauge<br/>
                     active_browsers 12
                   </div>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                   <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                     <Eye className="w-5 h-5 text-rose-500" /> Sentry Error Tracking
                   </h3>
                   <p className="text-sm text-slate-400 mb-4">
                     Structured exception handling with full stack traces.
                   </p>
                   <ul className="space-y-2 text-sm text-slate-300">
                     <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-slate-500" /> PII Stripping (Emails/IPs redacted)</li>
                     <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-slate-500" /> Alerting via Slack #ops-alerts</li>
                     <li className="flex items-center gap-2"><GitBranch className="w-4 h-4 text-slate-500" /> Release tracking (suspect commits)</li>
                   </ul>
                </div>
             </div>
          </div>
        )}

        {/* STRATEGY TAB */}
        {activeTab === 'STRATEGY' && (
          <div className="space-y-6">
             <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
               <h3 className="text-xl font-bold text-white mb-4">Canary Deployment Strategy</h3>
               <div className="flex items-center justify-between gap-4 text-center">
                 <div className="flex-1 bg-slate-900 p-4 rounded-lg border border-slate-800 opacity-50">
                   <span className="block text-slate-400 text-xs uppercase font-bold mb-2">Stage 1</span>
                   <div className="text-lg font-bold text-white">10% Traffic</div>
                   <p className="text-xs text-slate-500 mt-1">Internal + Beta Users</p>
                 </div>
                 <ArrowRight className="text-slate-600" />
                 <div className="flex-1 bg-slate-900 p-4 rounded-lg border border-slate-800">
                   <span className="block text-indigo-400 text-xs uppercase font-bold mb-2">Stage 2</span>
                   <div className="text-lg font-bold text-white">50% Traffic</div>
                   <p className="text-xs text-slate-500 mt-1">Monitor Error Rate</p>
                 </div>
                 <ArrowRight className="text-slate-600" />
                 <div className="flex-1 bg-slate-900 p-4 rounded-lg border border-slate-800">
                   <span className="block text-emerald-400 text-xs uppercase font-bold mb-2">Stage 3</span>
                   <div className="text-lg font-bold text-white">100% Traffic</div>
                   <p className="text-xs text-slate-500 mt-1">Full Rollout</p>
                 </div>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                    <GitMerge className="w-5 h-5 text-purple-500" /> Feature Flags
                  </h3>
                  <p className="text-sm text-slate-400 mb-4">
                    We use LaunchDarkly or Redis-backed flags to toggle features without redeploying.
                  </p>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between bg-slate-900 p-2 rounded">
                       <span className="text-slate-300">ENABLE_NEW_SCRAPER_ENGINE</span>
                       <span className="text-emerald-400">TRUE (10%)</span>
                    </div>
                    <div className="flex justify-between bg-slate-900 p-2 rounded">
                       <span className="text-slate-300">ALLOW_CRYPTO_OFFERS</span>
                       <span className="text-rose-400">FALSE</span>
                    </div>
                  </div>
               </div>
               
               <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                    <Server className="w-5 h-5 text-blue-500" /> Environment Separation
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex justify-between border-b border-slate-700 pb-1">
                      <span>Development</span>
                      <span className="text-slate-500">Local Docker Compose</span>
                    </li>
                    <li className="flex justify-between border-b border-slate-700 pb-1">
                      <span>Staging</span>
                      <span className="text-slate-500">AWS (Scaled Down)</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Production</span>
                      <span className="text-slate-500">AWS (Multi-AZ)</span>
                    </li>
                  </ul>
               </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper component
const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={`w-6 h-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export default DeploymentArchitecture;
