# Testing Guide for DeepSeek Integration

This document provides a comprehensive testing guide to verify that the DeepSeek v3 integration is working correctly and all features are preserved.

## Prerequisites

1. Set up the API key:
   ```bash
   echo "OPENAI_API_KEY=your-deepseek-api-key" > .env.local
   ```

2. Install dependencies (if not already done):
   ```bash
   npm install
   ```

## Testing Steps

### 1. Build Verification

Test that the application builds without errors:

```bash
npm run build
```

**Expected Result**: Build completes successfully with no errors.

✅ **Status**: PASSED

### 2. Type Checking

Verify TypeScript types are correct:

```bash
npm run typecheck
```

**Expected Result**: No errors in AI-related files (auth errors are pre-existing).

✅ **Status**: PASSED (AI files have no type errors)

### 3. Start Development Servers

Start both the Next.js and Genkit development servers:

Terminal 1:
```bash
npm run dev
```

Terminal 2:
```bash
npm run genkit:dev
```

**Expected Result**: Both servers start without errors.

### 4. Test AI Flows

#### Test 1: List Majors

Navigate to a college detail page and test listing majors.

**Input**: 
- College: "MIT" or "Stanford University"

**Expected Output**:
- List of majors offered by the college
- Response time: < 10 seconds

**Test via UI**: Add a college and view its majors list

#### Test 2: Populate College Info

Test auto-populating college information.

**Input**:
- College name: "Harvard University"

**Expected Output**:
- Application deadlines
- Application portal URL
- List of majors
- Acceptance rate

**Test via UI**: Add a new college and trigger auto-populate

#### Test 3: Estimate Acceptance Rate

Test the acceptance rate estimation for a student profile.

**Input**:
- College: "UC Berkeley"
- Major: "Computer Science"
- GPA: 3.8
- Test Score: 1450 (SAT)
- Residency: "In-State"

**Expected Output**:
- Acceptance rate percentage estimate
- Detailed reasoning
- Response considers residency status

**Test via UI**: Use the acceptance rate calculator feature

#### Test 4: Generate Student Profile

Test generating a hypothetical student profile.

**Input**:
- College: "MIT"
- Major: "Mechanical Engineering"
- Residency: "Out-of-State"

**Expected Output**:
- Realistic GPA (e.g., 3.9-4.0)
- SAT score (e.g., 1500-1600)
- ACT score (e.g., 34-36)
- Extracurricular activities description

**Test via UI**: Use the profile generator feature

### 5. Rate Limit Testing

The main reason for switching to DeepSeek was to avoid the 20 RPD limit.

**Test**: Make multiple consecutive AI requests (10-20 requests)

**Expected Result**: All requests succeed without rate limit errors

### 6. Error Handling

Test error scenarios:

#### Test 6.1: Invalid API Key
- Temporarily set wrong API key
- Attempt to use AI feature
- Should show user-friendly error message

#### Test 6.2: Network Error
- Simulate network issues
- Retry logic should work with exponential backoff (in populate-college-info.ts)

### 7. Response Quality

Compare responses between old (Gemini) and new (DeepSeek) implementation:

**Test areas**:
- Accuracy of college information
- Quality of reasoning for acceptance rates
- Completeness of major lists
- Realistic student profiles

**Expected**: Responses should be of comparable or better quality

### 8. Performance Testing

Measure response times for each flow:

| Flow | Target Time | Notes |
|------|-------------|-------|
| listMajors | < 10s | Simple list generation |
| populateCollegeInfo | < 15s | More complex data gathering |
| estimateAcceptanceRate | < 10s | Analysis and reasoning |
| generateStudentProfile | < 10s | Profile generation |

### 9. End-to-End User Flows

#### Flow A: Add New College
1. Open application
2. Click "Add College"
3. Enter college name
4. Click "Auto-populate information"
5. Verify all fields populate correctly
6. Save college

**Expected**: College is added with complete information

#### Flow B: Check Acceptance Chances
1. Open college details
2. Click "Check my chances"
3. Enter student profile information
4. Submit
5. Review acceptance rate estimate and reasoning

**Expected**: Realistic estimate with detailed reasoning

## Known Limitations

1. **Real-time Data**: DeepSeek v3 doesn't have web search capabilities like Gemini with Google Search. Information is based on training data, which may not include the very latest deadlines or acceptance rates.

2. **Knowledge Cutoff**: DeepSeek has a knowledge cutoff date. For the most current information, consider integrating with real-time data sources.

3. **Environment Access**: In sandboxed/offline environments, API calls will fail. Ensure proper internet connectivity.

## Success Criteria

- ✅ All builds and type checks pass
- ✅ All 4 AI flows work correctly
- ✅ No rate limit issues with normal usage
- ✅ Response quality is maintained or improved
- ✅ Error handling works properly
- ✅ Performance is acceptable (< 15s for all flows)

## Troubleshooting

### Issue: "Connection error"
**Solution**: 
- Verify API key is correct
- Check internet connectivity
- Verify DeepSeek API endpoint: `https://api.deepseek.com/v1`

### Issue: "Model not found"
**Solution**:
- Verify model reference is `deepseek/deepseek-chat`
- Check plugin name in genkit.ts is `deepseek`

### Issue: Poor response quality
**Solution**:
- Review and refine prompts in flow files
- Consider adjusting temperature or other model parameters
- Test with different colleges/scenarios

## Next Steps After Testing

1. Update any prompts that need refinement
2. Add monitoring for API usage and costs
3. Consider implementing web search functionality if real-time data is critical
4. Document any differences in behavior compared to Gemini
