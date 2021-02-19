# Staging

1. Create temporary database
1. Connect DataGrip to temporary database
1. Drop staging database
1. Create new staging database
1. Connect to staging database
1. Run init scripts against staging database
1. Run migration scripts against staging database (excluding sample.organisms)
1. Only continue if all looks good.

# Production

1. Copy data from sample.organisms from production to staging
1. Repeat staging steps 1-7 on production
1. Copy data from sample.organisms from staging to production





