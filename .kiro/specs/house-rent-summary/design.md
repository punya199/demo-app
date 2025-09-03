# House Rent Summary Design Document

## Overview

The House Rent Summary page will be implemented as a new route within the existing house-rent feature. It will reuse the existing data structures and services but present the information in a clean, printable format optimized for A4 paper. The design will follow responsive design principles while ensuring excellent print output quality.

## Architecture

### Component Structure

```
PageHouseRentSummary
├── HouseRentSummaryHeader
│   ├── HouseRentTitle
│   ├── DateRangeDisplay
│   └── PrintButton
├── HouseRentSummaryContent
│   ├── BasicInfoSection
│   ├── RentalDetailsSection
│   │   └── RentalDetailsTable
│   ├── MemberDetailsSection
│   │   └── MemberDetailsTable
│   ├── ElectricitySummarySection
│   └── FinancialSummarySection
└── HouseRentSummaryFooter
    └── NavigationButtons
```

### Data Flow

The summary page will:
1. Use the same `useGetHouseRent` hook as the detail page
2. Transform the data for display-optimized presentation
3. Apply responsive and print-specific styling
4. Provide print functionality through browser APIs

## Components and Interfaces

### Core Interfaces

The summary page will reuse existing interfaces from `house-rent-interface.ts`:
- `IHouseRentFormValues` - Main data structure
- `IHouseRentDetailData` - Monthly rental data
- `IHouseRentMemberData` - Member information
- `IElectricitySummaryData` - Electricity calculations

### New Display Interfaces

```typescript
interface IHouseRentSummaryProps {
  houseRentId: string
}

interface ISummarySection {
  title: string
  children: React.ReactNode
  printBreak?: boolean
}

interface IPrintableTableProps {
  data: any[]
  columns: ISummaryTableColumn[]
  title?: string
}

interface ISummaryTableColumn {
  title: string
  dataIndex: string
  render?: (value: any, record: any) => React.ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
}
```

### Component Specifications

#### PageHouseRentSummary
- Main container component
- Handles data fetching and loading states
- Manages print functionality
- Applies responsive layout classes

#### HouseRentSummaryHeader
- Displays house name and date range
- Includes print button with print icon using react-to-print
- Responsive header that adapts to screen size
- Hidden during print (except essential info)
- Print button triggers react-to-print with custom page styling

#### HouseRentSummaryContent
- Main content area with all rental information
- Organized into logical sections
- Uses CSS Grid for responsive layout
- Optimized spacing for print

#### BasicInfoSection
- House name, base rent, payment fee
- Internet and air conditioning pricing
- Displayed in a clean card layout

#### RentalDetailsSection
- Monthly breakdown table
- Shows dates, house rent, water, electricity
- Responsive table that stacks on mobile
- Print-optimized column widths
- Configured with page breaks before and after for dedicated print pages

#### MemberDetailsSection
- Member information table
- Electricity usage, AC units, payments
- Calculated costs per member
- Expandable on mobile, full table on desktop

#### ElectricitySummarySection
- Total units, price, and calculations
- Visual emphasis on key numbers
- Clear formatting for financial data

#### FinancialSummarySection
- Overall totals and breakdowns
- Cost per person calculations
- Payment summary information

## Responsive Design Strategy

### Breakpoints
- Mobile: < 768px (single column, stacked layout)
- Tablet: 768px - 1024px (two-column hybrid)
- Desktop: > 1024px (multi-column layout)
- Print: A4 optimized (210mm x 297mm)

### Layout Patterns

#### Desktop Layout (> 1024px)
```
┌─────────────────────────────────────┐
│           Header & Print            │
├─────────────────┬───────────────────┤
│   Basic Info    │   Electricity     │
│                 │   Summary         │
├─────────────────┴───────────────────┤
│         Rental Details Table        │
├─────────────────────────────────────┤
│         Member Details Table        │
├─────────────────────────────────────┤
│        Financial Summary            │
└─────────────────────────────────────┘
```

#### Mobile Layout (< 768px)
```
┌─────────────────┐
│     Header      │
├─────────────────┤
│   Basic Info    │
├─────────────────┤
│  Electricity    │
│   Summary       │
├─────────────────┤
│ Rental Details  │
│   (Stacked)     │
├─────────────────┤
│ Member Details  │
│   (Cards)       │
├─────────────────┤
│   Financial     │
│   Summary       │
└─────────────────┘
```

## Print Optimization

### CSS Print Styles

```css
@media print {
  /* Page setup */
  @page {
    size: A4;
    margin: 20mm;
  }
  
  /* Hide non-essential elements */
  .no-print {
    display: none !important;
  }
  
  /* Optimize typography */
  body {
    font-size: 12pt;
    line-height: 1.4;
    color: #000;
  }
  
  /* Table optimization */
  table {
    page-break-inside: avoid;
    border-collapse: collapse;
  }
  
  /* Section breaks */
  .page-break-before {
    page-break-before: always;
  }
  
  .page-break-after {
    page-break-after: always;
  }
}
```

### Print-Specific Features
- Remove background colors and shadows
- Use high contrast text
- Optimize table column widths
- Add page headers with house name
- Ensure proper page breaks
- Include print date/time

## Data Presentation

### Number Formatting
- Currency: ฿1,234.56 format
- Percentages: 12.34% format
- Units: 123 kWh format
- Dates: DD/MM/YYYY format

### Table Design
- Alternating row colors (screen only)
- Clear headers with proper alignment
- Responsive column widths
- Mobile-friendly stacked layout
- Print-optimized spacing

### Visual Hierarchy
- H1: House name and main title
- H2: Section headers
- H3: Subsection headers
- Body: Regular content
- Emphasis: Important numbers and totals

## Error Handling

### Loading States
- Skeleton loading for main content
- Loading spinner for data fetching
- Progressive loading of sections

### Error States
- 404 handling for invalid house rent IDs
- Permission error handling
- Network error recovery
- Graceful degradation for missing data

### Print Error Handling
- Browser compatibility checks
- Print dialog error handling
- Fallback for unsupported browsers

### React-to-Print Integration
- Enhanced print functionality using react-to-print library
- Better control over print content and styling
- Improved page break handling and content flow
- Custom print document titles and page styling
- Separation of print content from screen UI elements

## Performance Considerations

### Optimization Strategies
- Reuse existing data fetching hooks
- Memoize expensive calculations
- Lazy load non-critical components
- Optimize images for print

### Bundle Size
- Share components with existing house-rent pages
- Use existing utility functions
- Minimize additional dependencies

## Accessibility

### Screen Reader Support
- Proper heading hierarchy
- Table headers and captions
- Alt text for any images
- ARIA labels for interactive elements

### Keyboard Navigation
- Tab order for interactive elements
- Keyboard shortcuts for print (Ctrl+P)
- Focus management
- Skip links for long content

### Color and Contrast
- High contrast for print
- Color-blind friendly palette
- Sufficient contrast ratios (4.5:1 minimum)
- No color-only information conveyance

## Integration Points

### Routing
- New route: `/house-rent/:houseRentId/summary`
- Protected route requiring read permissions
- Integration with existing app routing

### Navigation
- Link from house rent detail page
- Link from house rent list page
- Breadcrumb navigation
- Back button functionality

### Permissions
- Reuse existing house rent permissions
- Require read access to house rent data
- Handle unauthorized access gracefully