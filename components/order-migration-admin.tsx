'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Database, 
  Users, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  FileText
} from 'lucide-react'
import { 
  migrateAllLegacyOrders, 
  generateMigrationReport,
  LegacyOrder
} from '@/lib/order-migration-utils'

export default function OrderMigrationAdmin() {
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationReport, setMigrationReport] = useState<any>(null)
  const [migrationStats, setMigrationStats] = useState<any>(null)

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true)
    try {
      const report = await generateMigrationReport()
      setMigrationReport(report)
    } catch (error) {
      console.error('Failed to generate migration report:', error)
      alert('Failed to generate migration report. Check console for details.')
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const handleMigrateOrders = async () => {
    if (!confirm('This will migrate legacy orders to customer databases. This action cannot be undone. Continue?')) {
      return
    }

    setIsMigrating(true)
    try {
      const stats = await migrateAllLegacyOrders()
      setMigrationStats(stats)
      
      // Refresh the report after migration
      if (migrationReport) {
        const newReport = await generateMigrationReport()
        setMigrationReport(newReport)
      }
      
      alert(`Migration completed! Migrated: ${stats.migrated}, Skipped: ${stats.skipped}, Errors: ${stats.errors}`)
    } catch (error) {
      console.error('Migration failed:', error)
      alert('Migration failed. Check console for details.')
    } finally {
      setIsMigrating(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Database className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold">Order Migration Tool</h1>
          <p className="text-gray-600">
            Migrate existing orders from JSON files to customer order history in Firestore
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <Button 
          onClick={handleGenerateReport}
          disabled={isGeneratingReport}
          className="flex items-center gap-2"
        >
          {isGeneratingReport ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          {isGeneratingReport ? 'Generating...' : 'Generate Migration Report'}
        </Button>

        {migrationReport && (
          <Button 
            onClick={handleMigrateOrders}
            disabled={isMigrating || migrationReport.migratable.length === 0}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            {isMigrating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            {isMigrating ? 'Migrating...' : `Migrate ${migrationReport.migratable.length} Orders`}
          </Button>
        )}
      </div>

      {/* Migration Stats */}
      {migrationStats && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Migration Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{migrationStats.processed}</div>
                <div className="text-sm text-gray-600">Processed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{migrationStats.migrated}</div>
                <div className="text-sm text-gray-600">Migrated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{migrationStats.skipped}</div>
                <div className="text-sm text-gray-600">Skipped</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{migrationStats.errors}</div>
                <div className="text-sm text-gray-600">Errors</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Migration Report */}
      {migrationReport && (
        <Card>
          <CardHeader>
            <CardTitle>Migration Report</CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Total Orders: {migrationReport.totalOrders}</span>
              <span className="text-green-600">Migratable: {migrationReport.migratable.length}</span>
              <span className="text-yellow-600">Not Migratable: {migrationReport.notMigratable.length}</span>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="migratable">
              <TabsList className="mb-4">
                <TabsTrigger value="migratable">
                  Migratable Orders ({migrationReport.migratable.length})
                </TabsTrigger>
                <TabsTrigger value="not-migratable">
                  Not Migratable ({migrationReport.notMigratable.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="migratable" className="space-y-4">
                {migrationReport.migratable.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No orders can be migrated at this time.</p>
                ) : (
                  <div className="space-y-3">
                    {migrationReport.migratable.map((item: any) => (
                      <Card key={item.orderId} className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Order {item.orderId}</span>
                                <ArrowRight className="h-4 w-4 text-gray-400" />
                                <span className="text-blue-600">{item.bestMatchName}</span>
                              </div>
                              <div className="text-sm text-gray-600">
                                Customer: {item.customerName} • Matches: {item.matches}
                              </div>
                            </div>
                            <Badge 
                              variant="secondary" 
                              className="bg-green-100 text-green-800 border-green-200"
                            >
                              {Math.round(item.bestMatchConfidence * 100)}% match
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="not-migratable" className="space-y-4">
                {migrationReport.notMigratable.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">All orders can be migrated!</p>
                ) : (
                  <div className="space-y-3">
                    {migrationReport.notMigratable.map((item: any) => (
                      <Card key={item.orderId} className="border-l-4 border-l-yellow-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Order {item.orderId}</span>
                                <AlertCircle className="h-4 w-4 text-yellow-500" />
                              </div>
                              <div className="text-sm text-gray-600">
                                Customer: {item.customerName}
                              </div>
                            </div>
                            <Badge variant="outline" className="text-yellow-600">
                              {item.reason}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">How This Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-blue-800">
          <p>
            This tool migrates historical orders from JSON files to individual customer order histories in Firestore.
          </p>
          <div className="space-y-2">
            <p><strong>Step 1:</strong> Generate a migration report to see which orders can be migrated</p>
            <p><strong>Step 2:</strong> Review the matches and their confidence scores</p>
            <p><strong>Step 3:</strong> Run the migration to move orders to customer accounts</p>
          </div>
          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="font-semibold">Matching Criteria:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Customer display name (80% confidence)</li>
              <li>Phone number (90% confidence)</li>
              <li>Delivery address (60% confidence)</li>
              <li>Combined matches increase confidence</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
