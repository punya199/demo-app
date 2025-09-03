# House Rent Summary Design Document

## Overview

The House Rent Summary page will be implemented as a new route within the existing house-rent feature. It will reuse the existing data structures and services but present the information in a clean, printable format optimized for A4 paper. The design will follow responsive design principles while ensuring excellent print output quality.

## Architecture

### Component Structure (Actual Implementation)

```
PageHouseRentSummary
├── Global (Emotion CSS for print styles)
├── HouseRentSummaryHeader
│   ├── House name and date range display
│   └── Print button with react-to-print integration
└── HouseRentSummaryContent (printable content)
    ├── SummarySection (Basic Information)
    │   └── BasicInfoSection
    ├── SummarySection (Electricity Summary - Inline)
    │   └── Inline electricity summary grid
    ├── SummarySection (Monthly Rental Details)
    │   └── RentalDetailsSection
    │       ├── Desktop responsive table
    │       └── Mobile card layout
    └── SummarySection (Member Summary)
        └── MemberDetailsSection
            ├── Complex calculation engine
            ├── Desktop comprehensive table
            └── Mobile detailed cards
```

### Data Flow (Actual Implementation)

The summary page:
1. Uses `useGetHouseRent` hook for data fetching with loading and error states
2. Transforms API data using `calculateElectricitySummary` helper function
3. Converts attachment data to proper UploadFile format with secure URLs
4. Implements react-to-print with custom page styling and document titles
5. Uses `useMemo` for performance optimization of data transformations
6. Provides comprehensive error handling with NotFound component fallback

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

#### MemberDetailsSection (Comprehensive Implementation)
- Complex financial calculation engine with 13 different cost components
- Individual member cost breakdown including house rent, air conditioning, utilities
- Payment deduction tracking for internet and electricity direct payments
- Responsive design with detailed desktop table (13 columns) and mobile cards
- Real-time calculation of final payments and monthly averages
- Summary totals row with grand total calculations

#### ElectricitySummarySection (Integrated Implementation)
- Integrated directly into PageHouseRentSummary as inline grid section
- Displays total units, total price, price per unit, and shared units
- Responsive 2-column grid layout with proper formatting
- Uses existing electricity summary calculations from helper functions

#### FinancialSummarySection (Integrated into MemberDetailsSection)
- Financial summaries integrated into comprehensive MemberDetailsSection
- All cost calculations, deductions, and final payments handled in single component
- Mobile summary cards show grand totals for all members
- Desktop table includes summary row with complete financial breakdown

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

### React-to-Print Integration (Implemented)
- Enhanced print functionality using react-to-print library v3.1.1
- Custom `useReactToPrint` hook with `contentRef` for precise print content control
- Dynamic document titles based on house rent name
- Comprehensive page styling with A4 format, margins, and typography
- Page break controls for RentalDetailsSection with dedicated page allocation
- Separation of print content from screen UI elements using ref-based targeting
- Fallback to `window.print()` for backward compatibility

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