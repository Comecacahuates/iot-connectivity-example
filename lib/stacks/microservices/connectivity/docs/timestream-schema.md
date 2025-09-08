# Timestream Storage Schema - IoT Connectivity Events

## Database Structure

**Database**: `connectivity-db`  
**Table**: `device-events`

## Record Structure

### Dimensions
| Name | Type | Description | Source |
|------|------|-------------|---------|
| `clientId` | string | Client identifier | `clientId` from IoT message |
| `eventType` | string | Event type: `connected` or `disconnected` | `eventType` from IoT message |
| `sessionIdentifier` | string | Connection session identifier | `sessionIdentifier` from IoT message |
| `disconnectReason` | string | Reason for disconnection (disconnect events only) | `disconnectReason` from IoT message |

### Time Field
| Field | Type | Description |
|-------|------|-------------|
| `Time` | timestamp | Event occurrence time | `timestamp` from IoT message (Unix milliseconds) |

## Record Examples

### Connect Event
```json
{
  "Dimensions": [
    {"Name": "clientId", "Value": "186b5"},
    {"Name": "eventType", "Value": "connected"},
    {"Name": "sessionIdentifier", "Value": "00000000-0000-0000-0000-000000000000"}
  ],
  "Time": "1573002230757",
  "TimeUnit": "MILLISECONDS"
}
```

### Disconnect Event
```json
{
  "Dimensions": [
    {"Name": "clientId", "Value": "186b5"},
    {"Name": "eventType", "Value": "disconnected"},
    {"Name": "sessionIdentifier", "Value": "00000000-0000-0000-0000-000000000000"},
    {"Name": "disconnectReason", "Value": "CLIENT_INITIATED_DISCONNECT"}
  ],
  "Time": "1573002340451",
  "TimeUnit": "MILLISECONDS"
}
```

## Analytics Queries

### Connection Events Count by Device
```sql
SELECT clientId,
       eventType,
       COUNT(*) as event_count
FROM "connectivity-db"."device-events"
GROUP BY clientId, eventType
```

### Connection Frequency Over Time
```sql
SELECT clientId,
       COUNT(*) as connection_count,
       bin(time, 1h) as hour
FROM "connectivity-db"."device-events"
WHERE eventType = 'connected'
GROUP BY clientId, bin(time, 1h)
ORDER BY hour DESC
```

### Disconnect Reasons Analysis
```sql
SELECT disconnectReason,
       COUNT(*) as disconnect_count
FROM "connectivity-db"."device-events"
WHERE eventType = 'disconnected' AND disconnectReason IS NOT NULL
GROUP BY disconnectReason
```

### Device Activity Timeline
```sql
SELECT clientId,
       eventType,
       time,
       sessionIdentifier
FROM "connectivity-db"."device-events"
WHERE clientId = 'your-client-id'
ORDER BY time DESC
```

### Most Active Devices
```sql
SELECT clientId,
       COUNT(*) as total_events
FROM "connectivity-db"."device-events"
GROUP BY clientId
ORDER BY total_events DESC
LIMIT 10
```

## Data Retention

- **Memory Store**: 24 hours (fast queries for recent data)
- **Magnetic Store**: 365 days (cost-effective long-term storage)

## Notes

- All events are stored as dimension-only records (no measures)
- Only fields available in AWS IoT connectivity messages are stored
- Connect events do not have `disconnectReason` dimension
- All timestamps are stored in milliseconds since Unix epoch
- Use `sessionIdentifier` to correlate connect/disconnect events in queries
