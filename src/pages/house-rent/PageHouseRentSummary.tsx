import { css, Global } from '@emotion/react'
import { useMemo, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useReactToPrint } from 'react-to-print'
import { NotFound } from '../../components/NotFound'
import { appConfig } from '../../config/app-config'
import { LoadingSpin } from '../../layouts/LoadingSpin'
import { BasicInfoSection } from './components/BasicInfoSection'
import { HouseRentSummaryContent, SummarySection } from './components/HouseRentSummaryContent'
import { HouseRentSummaryHeader } from './components/HouseRentSummaryHeader'
import { MemberDetailsSection } from './components/MemberDetailsSection'
import { RentalDetailsSection } from './components/RentalDetailsSection'
import { calculateElectricitySummary } from './house-rent-helper'
import { IHouseRentFormValues } from './house-rent-interface'
import { useGetHouseRent } from './house-rent-service'

export const PageHouseRentSummary = () => {
  const { houseRentId } = useParams<{ houseRentId: string }>()
  const { data: houseRentData, isLoading, error } = useGetHouseRent(houseRentId)
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `House Rent Summary - ${houseRentData?.houseRent.name || 'Report'}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
      @media print {
        .no-print {
          display: none !important;
        }
        body {
          font-size: 12pt;
          line-height: 1.4;
          color: #000;
        }
        table {
          page-break-inside: avoid;
          border-collapse: collapse;
        }
        .page-break-before {
          page-break-before: always;
          break-before: page;
        }
        .page-break-after {
          page-break-after: always;
          break-after: page;
        }
        .rental-details-section {
          page-break-before: always;
          page-break-after: always;
          break-before: page;
          break-after: page;
        }
      }
    `,
  })

  const summaryData = useMemo((): IHouseRentFormValues | undefined => {
    if (!houseRentData) return undefined

    return {
      ...houseRentData.houseRent,
      electricitySummary: calculateElectricitySummary(
        houseRentData.houseRent.rents,
        houseRentData.houseRent.members
      ),
      attachments: houseRentData.houseRent.attachments.map((attachment) => ({
        uid: attachment.id,
        name: attachment.fileName,
        url: `${appConfig().VITE_API_DOMAIN}/attachments/${attachment.id}/file`,
        thumbUrl: `${appConfig().VITE_API_DOMAIN}/attachments/${attachment.id}/file?thumbnail=true`,
      })),
    }
  }, [houseRentData])

  if (isLoading) {
    return <LoadingSpin />
  }

  if (error || !summaryData) {
    return <NotFound />
  }

  return (
    <>
      <Global
        styles={css`
          @media print {
            .no-print {
              display: none !important;
            }
            @page {
              size: A4;
              margin: 20mm;
            }
            body {
              font-size: 12pt;
              line-height: 1.4;
              color: #000;
            }
            table {
              page-break-inside: avoid;
              border-collapse: collapse;
            }
            .page-break-before {
              page-break-before: always;
            }
            .page-break-after {
              page-break-after: always;
            }
          }
        `}
      />

      <div className="min-h-screen bg-gray-50 print:bg-white">
        <div className="container mx-auto py-8 print:py-4">
          <HouseRentSummaryHeader data={summaryData} onPrint={handlePrint} />

          <div ref={printRef}>

            <HouseRentSummaryContent>
              <SummarySection
                title="Basic Information"
                colSpan={{ default: 1, lg: 6 }}
              >
                <BasicInfoSection data={summaryData} />
              </SummarySection>

              <SummarySection
                title="Electricity Summary"
                colSpan={{ default: 1, lg: 6 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-700">Total Units:</span>
                    <span className="ml-2 font-semibold">{summaryData.electricitySummary.totalUnit.toLocaleString()} kWh</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Total Price:</span>
                    <span className="ml-2 font-semibold">฿{summaryData.electricitySummary.totalPrice.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Price per Unit:</span>
                    <span className="ml-2 font-semibold">฿{summaryData.electricitySummary.pricePerUnit.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Shared Units:</span>
                    <span className="ml-2 font-semibold">{summaryData.electricitySummary.shareUnit.toLocaleString()} kWh</span>
                  </div>
                </div>
              </SummarySection>

              <SummarySection
                title="Monthly Rental Details"
                colSpan={{ default: 1, lg: 12 }}
                printBreak={true}
                className="rental-details-section"
              >
                <RentalDetailsSection rents={summaryData.rents} />
              </SummarySection>

              <SummarySection
                title="Member Summary"
                colSpan={{ default: 1, lg: 12 }}
                printBreak={true}
              >
                <MemberDetailsSection data={summaryData} />
              </SummarySection>
            </HouseRentSummaryContent>
          </div>
        </div>
      </div>
    </>
  )
}