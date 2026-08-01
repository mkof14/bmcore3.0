# Rollback Procedures

## When to Rollback

Immediate rollback triggers:
- Critical functionality broken
- Data corruption detected
- Security vulnerability exposed
- Performance degradation > 300%
- Error rate > 5%

## Pre-Rollback Checklist

- [ ] Identify the problematic deployment
- [ ] Notify team in incident channel
- [ ] Document current symptoms
- [ ] Verify last known good version
- [ ] Check if database migration was included

## Vercel Application Rollback

### Via Vercel Dashboard

1. Navigate to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select BioMath Core project
3. Go to "Deployments" tab
4. Find last stable deployment (usually marked with ✅)
5. Click three dots → "Promote to Production"
6. Confirm promotion

**Estimated time: 2-3 minutes**

### Via Vercel CLI

```bash
# List recent deployments
vercel ls bmcore3.0

# Rollback to specific deployment
vercel rollback [deployment-url]

# Or use deployment ID
vercel rollback --target [deployment-id]
```

### Instant Rollback Script

```bash
#!/bin/bash
# rollback.sh

echo "🔄 Rolling back to previous deployment..."

# Get the second most recent production deployment
PREVIOUS=$(vercel ls bmcore3.0 --prod | head -2 | tail -1 | awk '{print $1}')

echo "Found previous deployment: $PREVIOUS"
echo "Rolling back in 5 seconds... (Ctrl+C to cancel)"
sleep 5

vercel rollback $PREVIOUS

echo "✅ Rollback complete!"
echo "🔍 Verifying health check..."
curl https://biomathcore.com/api/health
```

## Database Rollback

### Non-Breaking Changes

If deployment doesn't include schema changes, application rollback is sufficient.

### Breaking Schema Changes

**Critical: Do not rollback if migration included data modifications**

```bash
# Check migration history
npx supabase migration list

# Revert specific migration (dangerous!)
npx supabase migration revert [migration-name]

# Apply corrective migration instead (safer)
npx supabase migration create fix_[issue_name]
```

### Safe Database Rollback Pattern

1. **Create compensating migration** instead of reverting
2. **Add missing columns** if rollback expects them
3. **Keep old columns** until rollback is stable
4. **Use feature flags** to disable new features

Example compensating migration:

```sql
-- If new column breaks old code, make it nullable
ALTER TABLE users ADD COLUMN new_feature_data jsonb DEFAULT NULL;

-- Old code ignores it, new code uses it
-- After rollback is stable, can remove or make required
```

## Feature Flag Rollback

Fastest way to disable problematic features:

```bash
# Via API
curl -X POST https://biomathcore.com/api/flags/set \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -d '{
    "flag": "ai.second_opinion",
    "enabled": false
  }'
```

Or via Admin Panel:
1. Go to Admin Panel → Feature Flags
2. Toggle off problematic feature
3. Click "Save"

**Estimated time: < 1 minute**

## Kill Switches

Emergency service disabling:

```sql
-- Disable all AI services
UPDATE feature_flags SET enabled = true WHERE flag_key LIKE 'killswitch.%';

-- Or specific service
UPDATE feature_flags SET enabled = true WHERE flag_key = 'killswitch.openai';
```

## Environment Variables Rollback

If bad config was deployed:

```bash
# Revert to previous env snapshot
vercel env pull .env.backup

# Re-apply correct values
vercel env add STRIPE_SECRET_KEY production < stripe_key.txt

# Trigger redeploy
vercel --prod
```

## Rollback Decision Tree

```
Issue detected
    ├─ Feature-specific? → Feature Flag OFF
    ├─ Config issue? → Update env vars + redeploy
    ├─ Code bug? → Vercel rollback
    ├─ Database issue? → Compensating migration
    └─ External service? → Kill switch
```

## Post-Rollback Actions

### Immediate (0-5 minutes)

- [ ] Verify health check: `curl https://biomathcore.com/api/health`
- [ ] Verify dependencies: `curl https://biomathcore.com/api/deps`
- [ ] Test critical user flows
- [ ] Update status page

### Short-term (5-30 minutes)

- [ ] Monitor error rates in logs
- [ ] Check Stripe webhook delivery
- [ ] Verify user authentication
- [ ] Test payment flow (test mode)
- [ ] Review audit logs

### Long-term (30 minutes - 24 hours)

- [ ] Root cause analysis
- [ ] Create incident report
- [ ] Update tests to catch issue
- [ ] Plan proper fix
- [ ] Schedule postmortem

## Communication Template

```
🚨 Incident: Rollback Initiated

Time: [timestamp]
Severity: [P0/P1/P2]
Status: Rolling back to [deployment-id]

Impact:
- [List affected features]
- [Estimated users affected]

Actions Taken:
1. Rolled back to [previous stable version]
2. [Other actions]

Next Steps:
- Monitor for [X] minutes
- Fix root cause: [ticket-link]

ETA to resolution: [estimate]
```

## Rollback Validation

After rollback, verify:

```bash
# Health check
curl https://biomathcore.com/api/health | jq .

# Dependencies check
curl https://biomathcore.com/api/deps | jq .

# User authentication
curl -X POST https://biomathcore.com/api/auth/signin \
  -d '{"email":"test@example.com","password":"test"}' | jq .

# Smoke tests
npm run test:smoke
```

## Preventing Future Rollbacks

1. **Gradual Rollouts**
   - Use feature flags for new features
   - Deploy to preview first
   - Monitor for 1 hour before promoting

2. **Better Testing**
   - Expand test coverage
   - Add integration tests for changes
   - Test in staging with production data subset

3. **Monitoring**
   - Set up alerts for error rate spikes
   - Monitor key metrics continuously
   - Automated health checks

4. **Safe Migrations**
   - Never remove columns immediately
   - Make new columns nullable initially
   - Use feature flags to switch logic

## Rollback Metrics

Track:
- Time to detect issue: [target < 5 minutes]
- Time to decision: [target < 2 minutes]
- Time to rollback: [target < 3 minutes]
- Time to verify: [target < 5 minutes]

**Total rollback time target: < 15 minutes**

## Escalation

If rollback fails:
1. Notify senior engineer
2. Consider full service pause
3. Review infrastructure status
4. Engage Vercel/Supabase support if needed

## Lessons Learned

After each rollback:
1. Document in `/docs/ops/incidents/[date].md`
2. Update this runbook
3. Add new tests
4. Consider process improvements
