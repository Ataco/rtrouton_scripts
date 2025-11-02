# Phase 2 Features - Advanced Workflow & Analytics

## 🚀 Overview

Phase 2 adds advanced automation, machine learning-powered risk prediction, enhanced analytics, and comprehensive reporting capabilities to the transplant workflow management system.

## ✨ New Features

### 1. Advanced Workflow Automation Engine

**Location**: `backend/src/services/workflowAutomationService.ts`

**Features**:
- **Automated Rule Processing**: Runs every 5 minutes to check workflow conditions
- **Condition Types**:
  - Time-based (elapsed time since case creation)
  - Status-based (organ match status changes)
  - Analytics-based (ischemia time thresholds)
  - Preservation-based (preservation time warnings)

**Supported Actions**:
- Send notifications (Socket.IO, email, SMS)
- Update organ match status
- Assign coordinators automatically
- Create tasks
- Send critical alerts
- Trigger analytics recalculation

**Example Rule**:
```json
{
  "name": "Preservation Time Warning",
  "conditions": [
    {
      "type": "preservation",
      "field": "totalColdIschemia",
      "operator": "gt",
      "value": 300
    }
  ],
  "actions": [
    {
      "type": "send_alert",
      "data": {
        "message": "Preservation time approaching limit",
        "actionRequired": true
      }
    }
  ]
}
```

### 2. ML-Based Risk Prediction

**Location**: `backend/src/services/riskPredictionService.ts`

**API Endpoints**:
- `GET /api/risk-prediction/organ-match/:id` - Predict success probability
- `POST /api/risk-prediction/recommend-preservation` - Get preservation method recommendations
- `POST /api/risk-prediction/batch-predict` - Batch predictions for multiple cases

**Prediction Model**:
- **Input Features**:
  - Donor age
  - Cold ischemia time
  - Warm ischemia time
  - Preservation score
  - Transport duration
  - Preservation modality quality

- **Outputs**:
  - Success probability (0-100%)
  - Risk score (0-100%)
  - Risk level (LOW, MODERATE, HIGH, CRITICAL)
  - Key risk factors with severity
  - Clinical recommendations

**Risk Factors Identified**:
- Advanced donor age (>60 years)
- Prolonged cold ischemia (>6 hours)
- Prolonged warm ischemia (>45 minutes)
- Basic preservation methods
- Extended transport time

**Frontend Component**: `RiskPredictionCard.tsx` displays predictions with visual indicators

### 3. Automated Report Generation

**Location**: `backend/src/services/reportGenerationService.ts`

**Report Types**:

#### Comprehensive Case Report
- Full donor information
- Complete case timeline
- All organ summaries
- Preservation analysis
- Communication logs
- Statistics

#### Organ-Specific Report
- Organ match details
- Preservation timeline
- Transport information
- Clinical notes
- Submitted forms
- Analytics data

#### Daily Summary Report
- All cases for selected date
- Total organs processed
- Form submissions count
- Organ type breakdown
- Average preservation scores

#### Analytics Report
- Customizable date range
- Organ type filtering
- Key metrics averages
- Preservation methods analysis
- Risk distribution
- Trend analysis

**API Endpoints**:
- `GET /api/report-generation/case/:id`
- `GET /api/report-generation/organ/:id`
- `GET /api/report-generation/daily-summary?date=YYYY-MM-DD`
- `GET /api/report-generation/analytics-report?startDate=...&endDate=...&organType=...`

### 4. Advanced Notification System

**Location**: `backend/src/services/notificationService.ts`

**Channels**:
- **Real-Time**: Socket.IO push notifications
- **Email**: For warnings and errors (configurable)
- **SMS**: For critical alerts (Twilio integration ready)

**Notification Types**:
- Coordinator assignment
- Preservation time warnings
- Transport ETA updates
- Surgeon updates
- Admin system events
- Missing report reminders

**Automated Checks**:
- Unassigned organs (hourly)
- Preservation time warnings (hourly)
- Missing reports (hourly)

**Features**:
- Severity levels (info, warning, error, success)
- Deep links to relevant pages
- Batch notifications
- HTML email templates
- Configurable thresholds

### 5. Enhanced Analytics Dashboard

**Location**: `frontend/src/pages/analytics/EnhancedAnalyticsPage.tsx`

**Components**:

#### PreservationChart
- Interactive bar chart
- Cold vs warm ischemia visualization
- Per-organ breakdown
- Responsive design

#### PreservationScoreGauge
- Circular gauge visualization
- Color-coded by quality
- Grade indicators (Excellent, Good, Fair, Poor)
- Animated transitions

#### Key Metrics
- Total cases processed
- Average ischemia times
- Average transport duration
- Preservation scores

**Features**:
- Date range filtering
- Organ type filtering
- Export to CSV
- Generate PDF reports
- Real-time data updates
- Dark mode support

### 6. Progressive Web App (PWA)

**Location**: `frontend/public/manifest.json`

**Features**:
- Installable on mobile devices
- Offline capability (when configured)
- Native app-like experience
- Push notification support
- Full-screen mode
- App icon and splash screen

**Installation**:
Users can install the app to their home screen on iOS/Android for quick access.

## 📊 Database Enhancements

No schema changes required - all Phase 2 features work with existing database structure.

## 🔧 API Additions

### Risk Prediction
```typescript
// Predict transplant success
GET /api/risk-prediction/organ-match/:organMatchId

// Recommend preservation method
POST /api/risk-prediction/recommend-preservation
{
  "organType": "HEART",
  "expectedColdTime": 300,
  "donorAge": 45
}

// Batch predictions
POST /api/risk-prediction/batch-predict
{
  "organMatchIds": ["id1", "id2", "id3"]
}
```

### Report Generation
```typescript
// Generate comprehensive case report
GET /api/report-generation/case/:donorCaseId

// Generate organ-specific report
GET /api/report-generation/organ/:organMatchId

// Generate daily summary
GET /api/report-generation/daily-summary?date=2025-11-02

// Generate analytics report
GET /api/report-generation/analytics-report?startDate=...&endDate=...
```

### Notifications
```typescript
// Send notification
POST /api/notifications/send
{
  "userId": "user-id",
  "type": "PRESERVATION_WARNING",
  "title": "Time Alert",
  "message": "Preservation time approaching limit",
  "severity": "warning",
  "link": "/cases/123"
}

// Get my notifications
GET /api/notifications/my-notifications
```

## 🎯 Usage Examples

### Risk Prediction in Case Detail

```typescript
import RiskPredictionCard from '@/components/analytics/RiskPredictionCard'

<RiskPredictionCard organMatchId={organMatchId} />
```

### Generate and Download Reports

```typescript
import { reportGenerationAPI } from '@/services/api'

// Generate case report
const response = await reportGenerationAPI.generateCaseReport(caseId)
console.log(response.data.report)

// Generate analytics report
const analyticsReport = await reportGenerationAPI.generateAnalyticsReport({
  startDate: '2025-01-01',
  endDate: '2025-11-02',
  organType: 'HEART'
})
```

### Automated Workflow Rules

Workflow templates can include automation rules that trigger automatically:

```json
{
  "name": "Heart Transplant Workflow",
  "type": "RECIPIENT",
  "organType": "HEART",
  "stages": [
    {
      "id": "evaluation",
      "name": "Recipient Evaluation",
      "automationRules": [
        {
          "name": "Auto-assign coordinator",
          "conditions": [
            {
              "type": "time",
              "field": "elapsed",
              "operator": "gt",
              "value": 30
            }
          ],
          "actions": [
            {
              "type": "notify",
              "data": {
                "message": "Case needs coordinator assignment",
                "severity": "warning",
                "toChat": true
              }
            }
          ]
        }
      ]
    }
  ]
}
```

## 📈 Performance

- Workflow automation runs every 5 minutes
- Notification checks run every hour
- Analytics calculations are cached
- Real-time updates via Socket.IO
- Batch operations for efficiency

## 🔐 Security

All Phase 2 features maintain HIPAA compliance:
- Full audit logging
- Role-based access control
- Encrypted data storage
- Secure API endpoints
- User activity tracking

## 🚧 Future Enhancements (Phase 3)

- Deep learning model training
- Integration with hospital EHR systems
- Mobile native apps (iOS/Android)
- Voice-to-text for clinical notes
- Advanced predictive analytics
- Multi-language support

## 📝 Configuration

### Enable Workflow Automation
Already enabled by default when server starts.

### Configure Notification Channels

Update `.env`:
```bash
# Email service
EMAIL_SERVICE_API_KEY=your-sendgrid-key
EMAIL_FROM=notifications@yourhospital.org

# SMS service (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### Customize Automation Rules

Edit workflow templates via Admin panel or API.

## 🎓 Training Resources

See `SETUP_GUIDE.md` for setup instructions.

## 📞 Support

For issues or questions about Phase 2 features:
1. Check this documentation
2. Review service code in `backend/src/services/`
3. Test API endpoints with Postman
4. Open GitHub issue with detailed description

---

**Phase 2 Status**: ✅ Complete
**Last Updated**: 2025-11-02
