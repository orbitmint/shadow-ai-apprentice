import { WorkMap, DialogueTurn } from '../types/apprentice';

export interface IncidentItem {
  id: string;
  incidentNumber: string;
  service: string;
  severity: 'P1 - Critical' | 'P2 - High' | 'P3 - Medium';
  timestamp: string;
  summary: string;
  targetSystem: string;
  currentAction: string;
  status: 'open' | 'mitigated' | 'escalated';
  customerTier: 'Tier 1 Enterprise' | 'Standard' | 'Internal';
}

export const INITIAL_INCIDENTS: IncidentItem[] = [
  {
    id: 'inc-8821',
    incidentNumber: 'INC-8821',
    service: 'Auth0 / Identity Proxy',
    severity: 'P3 - Medium',
    timestamp: '13:42 UTC',
    summary: 'Spike in token refresh latency on staging cluster',
    targetSystem: 'Staging K8s Pool',
    currentAction: 'Standard Pod Recycle',
    status: 'open',
    customerTier: 'Internal',
  },
  {
    id: 'inc-8822',
    incidentNumber: 'INC-8822',
    service: 'Core PostgreSQL Cluster (Shard 4)',
    severity: 'P1 - Critical',
    timestamp: '14:15 UTC (Peak US-East Hours)',
    summary: 'Deadlock cascade on Shard 4. Connection pool saturation at 94%.',
    targetSystem: 'Primary DB Node (us-east-1a)',
    currentAction: 'Pending Mitigation',
    status: 'open',
    customerTier: 'Tier 1 Enterprise',
  },
  {
    id: 'inc-8823',
    incidentNumber: 'INC-8823',
    service: 'Stripe Payment Ingress',
    severity: 'P2 - High',
    timestamp: '14:38 UTC',
    summary: 'Upstream 504 Gateway Timeouts from EU Banking API',
    targetSystem: 'Ingress Envoy Proxy',
    currentAction: 'Pending Mitigation',
    status: 'open',
    customerTier: 'Tier 1 Enterprise',
  },
];

export const TEACH_MODE_INCIDENT: IncidentItem = {
  id: 'inc-8830',
  incidentNumber: 'INC-8830',
  service: 'Core PostgreSQL Cluster (Shard 2)',
  severity: 'P1 - Critical',
  timestamp: '14:50 UTC (Peak Traffic)',
  summary: 'Lock contention on account ledger tables for Apex Global (Tier 1 VIP). Connection pool at 89%.',
  targetSystem: 'Primary DB Node (us-east-1b)',
  currentAction: 'Pending Triage',
  status: 'open',
  customerTier: 'Tier 1 Enterprise',
};

export const INCIDENT_WORK_MAP: WorkMap = {
  id: 'wm-sre-incident-01',
  title: "Marcus's Major Incident Triage Playbook",
  expertName: 'Marcus Vance',
  expertRole: 'Principal SRE (16 years on-call)',
  taskName: 'Production Database Lock Contention & Failover Triage',
  recordedAt: 'Today at 2:45 PM',
  steps: [
    {
      id: 'step-1',
      stepNumber: 1,
      title: 'Check customer tier and traffic window before restarting',
      screenMoment: {
        timestamp: '01:20',
        uiTarget: 'Grafana > Shard 4 Connection Pool (94%)',
        details: 'Checked customer tier: Tier 1 Enterprise (AcmeCorp) during 2 PM peak traffic.',
      },
      decision: 'Froze all restart scripts and initiated replica failover.',
      reason: '"Rebooting a primary database on a Tier 1 customer during peak US hours terminates 12,000 active sessions and triggers $50k/hour contractual SLA penalties. We failover to replica Shard 4B instead."',
      guardrails: [
        'NEVER reboot primary database nodes during peak hours (12 PM - 5 PM EST).',
        'If connection pool > 85% on Tier 1 customers: failover traffic to read-replica first.',
        'If unknown deadlock: capture memory dump before terminating queries.',
      ],
      confirmedByExpert: true,
    },
    {
      id: 'step-2',
      stepNumber: 2,
      title: 'Route ingress traffic to Read-Replica Shard 4B',
      screenMoment: {
        timestamp: '03:45',
        uiTarget: 'Consul Service Mesh > Route Weight Slider',
        details: 'Shifted 100% of read traffic to Shard 4B replica pool.',
      },
      decision: 'Shifted connection pool weight to replica 4B without downtime.',
      reason: '"Flipping traffic in Consul takes 400 milliseconds and users notice nothing. Rebooting drops the entire checkout funnel."',
      guardrails: [
        'Verify replica lag is under 2 seconds before shifting weight.',
        'Post incident notification to #tier1-support channel within 5 minutes.',
      ],
      confirmedByExpert: true,
    },
    {
      id: 'step-3',
      stepNumber: 3,
      title: 'Handle upstream gateway latency without recycling pods',
      screenMoment: {
        timestamp: '06:10',
        uiTarget: 'Stripe Gateway Ingress > Cache Purge',
        details: 'Flushed Redis idempotency keys rather than restarting ingress containers.',
      },
      decision: 'Purged Redis idempotency cache instead of restarting ingress pods.',
      reason: '"Restarting ingress pods during upstream banking timeouts causes a stampede effect that crashes all downstream microservices."',
      guardrails: [
        'Never restart ingress pods during external 504 gateway timeouts.',
        'Purge cache first to stop duplicate authorization retries.',
      ],
      confirmedByExpert: true,
    },
  ],
  coreGuardrails: [
    'NEVER reboot primary database nodes during peak traffic hours (12-5 PM EST).',
    'Tier 1 customer lock contention requires traffic shift to replica Shard 4B.',
    'Do not restart ingress pods on 504 gateway timeouts; purge Redis idempotency cache.',
  ],
  teachBackSummary:
    "Marcus triages critical outages by protecting active sessions: Never reboot a primary DB during peak traffic on Tier 1 customers. Always shift traffic to read-replica Shard 4B first via service mesh. And on payment gateway latency, clear the idempotency cache instead of bouncing the ingress pods.",
};

export const INCIDENT_DIALOGUE_HISTORY: DialogueTurn[] = [
  {
    id: 'inc-d-1',
    speaker: 'agent',
    persona: 'apprentice',
    text: "Quick question Marcus — why'd you failover to replica 4B instead of rebooting the primary DB node?",
    timestamp: '02:15',
    isGuardrail: true,
    questionContext: 'Database lock contention during peak hours',
  },
  {
    id: 'inc-d-2',
    speaker: 'expert',
    persona: 'sabine', // Uses expert voice
    text: "Rebooting the primary on a Tier 1 customer during 2 PM peak traffic kills 12,000 active transactions and triggers fifty-thousand dollar SLA penalties. Shifting traffic to replica 4B takes 400 milliseconds and drops zero users.",
    timestamp: '02:24',
    isGuardrail: true,
  },
  {
    id: 'inc-d-3',
    speaker: 'agent',
    persona: 'apprentice',
    text: "What's the hard guardrail where you would never reboot the cluster?",
    timestamp: '02:40',
    isGuardrail: true,
    questionContext: 'Peak hour database restart rule',
  },
  {
    id: 'inc-d-4',
    speaker: 'expert',
    persona: 'sabine',
    text: "Between noon and 5 PM EST, a primary reboot is strictly forbidden. If connection pools exceed 85%, failover to replica pool first.",
    timestamp: '02:52',
    isGuardrail: true,
  },
];
