'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  fetchSpeakers,
  fetchTranscripts,
  fetchCategories,
  fetchMetrics,
  fetchPieChartData,
  Speaker,
  Transcript,
  MetricsResponse,
  PieChartDataPoint,
} from '@/lib/reportsApi';
import { ReportsSidebar } from './ReportsSidebar';
import { AverageScoreCard } from './AverageScoreCard';
import { CategoryPieChart } from './CategoryPieChart';

export function ReportsPage() {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('dear_man');
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<number | undefined>();
  const [selectedTranscriptId, setSelectedTranscriptId] = useState<number | undefined>();
  const [documentNameFilter, setDocumentNameFilter] = useState<string>('');
  
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [pieChartData, setPieChartData] = useState<PieChartDataPoint[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter transcripts by document name
  const filteredTranscripts = useMemo(() => {
    if (!documentNameFilter) return transcripts;
    return transcripts.filter((t) =>
      t.name.toLowerCase().includes(documentNameFilter.toLowerCase())
    );
  }, [transcripts, documentNameFilter]);

  // Update selected transcript ID if filtered out
  useEffect(() => {
    if (selectedTranscriptId) {
      const transcriptExists = filteredTranscripts.some(
        (t) => t.id === selectedTranscriptId
      );
      if (!transcriptExists) {
        setSelectedTranscriptId(undefined);
      }
    }
  }, [filteredTranscripts, selectedTranscriptId]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [speakersData, transcriptsData, categoriesData] = await Promise.all([
          fetchSpeakers(),
          fetchTranscripts(),
          fetchCategories(),
        ]);
        
        setSpeakers(speakersData);
        setTranscripts(transcriptsData);
        setCategories(categoriesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error loading initial data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Load metrics and pie chart data when filters change
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch metrics for all categories to show all score cards
        const [sentimentMetrics, dearManMetrics, fastMetrics, pieData] = await Promise.all([
          fetchMetrics('sentiment', selectedSpeakerId, selectedTranscriptId),
          fetchMetrics('dear_man', selectedSpeakerId, selectedTranscriptId),
          fetchMetrics('fast', selectedSpeakerId, selectedTranscriptId),
          fetchPieChartData(selectedCategory, undefined, selectedSpeakerId, selectedTranscriptId),
        ]);
        
        // Combine all metrics
        setMetrics({
          averages: {
            sentiment: sentimentMetrics.averages.sentiment || {},
            dear_man: dearManMetrics.averages.dear_man || {},
            fast: fastMetrics.averages.fast || {},
          },
          label_counts: {
            sentiment: sentimentMetrics.label_counts.sentiment || {},
            dear_man: dearManMetrics.label_counts.dear_man || {},
            fast: fastMetrics.label_counts.fast || {},
          },
        });
        setPieChartData(pieData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load metrics');
        console.error('Error loading metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedCategory, selectedSpeakerId, selectedTranscriptId]);

  // Get subcategory breakdown for pie charts
  const getSubcategoryCharts = () => {
    if (!metrics || selectedCategory === 'sentiment') {
      return [];
    }

    const categoryData = metrics.label_counts[selectedCategory] || {};
    const subcategories =
      selectedCategory === 'dear_man'
        ? ['describe', 'express', 'assert', 'reinforce', 'mindful', 'appear_confident', 'negotiate']
        : ['fair', 'apologies', 'stick_to_values', 'truthful'];

    return subcategories.map((subcat) => {
      const counts = categoryData[subcat] || {};
      const total = Object.values(counts).reduce((sum: number, val: any) => sum + val, 0);
      
      const data: PieChartDataPoint[] = Object.entries(counts).map(([label, count]) => ({
        label,
        count: count as number,
        percentage: total > 0 ? ((count as number) / total) * 100 : 0,
      }));

      return {
        subcategory: subcat,
        title: subcat.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        data,
      };
    });
  };

  if (loading && !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <div
              className="w-12 h-12 rounded-xl mx-auto"
              style={{ backgroundColor: 'var(--color-calm-200)' }}
            />
          </div>
          <p style={{ color: 'var(--color-calm-400)' }}>Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="text-center max-w-md">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-safe-rose)' }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
            Error Loading Reports
          </h2>
          <p className="mb-4" style={{ color: 'var(--color-calm-600)' }}>
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const categoryAverages = metrics?.averages[selectedCategory] || {};
  const overallScore = categoryAverages.overall || 0;
  const maxScore = selectedCategory === 'dear_man' ? 7 : selectedCategory === 'fast' ? 4 : 1;

  const subScores = Object.entries(categoryAverages)
    .filter(([key]) => key !== 'overall')
    .map(([label, score]) => ({ label, score: score as number }));

  const subcategoryCharts = getSubcategoryCharts();

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--background)' }}>
      <ReportsSidebar
        speakers={speakers}
        transcripts={filteredTranscripts}
        selectedSpeakerId={selectedSpeakerId}
        selectedTranscriptId={selectedTranscriptId}
        selectedCategory={selectedCategory}
        documentNameFilter={documentNameFilter}
        onSpeakerChange={setSelectedSpeakerId}
        onTranscriptChange={setSelectedTranscriptId}
        onCategoryChange={setSelectedCategory}
        onDocumentNameChange={setDocumentNameFilter}
      />

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--foreground)' }}>
            Reports Dashboard
          </h1>

          {error && (
            <div
              className="mb-6 p-4 rounded-lg"
              style={{
                backgroundColor: 'var(--color-safe-rose)',
                color: 'var(--foreground)',
              }}
            >
              {error}
            </div>
          )}

          {/* Average Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <AverageScoreCard
              title="Sentiment"
              score={metrics?.averages.sentiment?.overall || 0}
              maxScore={1}
            />
            <AverageScoreCard
              title="DEAR MAN"
              score={metrics?.averages.dear_man?.overall || 0}
              maxScore={7}
              subScores={selectedCategory === 'dear_man' ? subScores : undefined}
            />
            <AverageScoreCard
              title="FAST"
              score={metrics?.averages.fast?.overall || 0}
              maxScore={4}
              subScores={selectedCategory === 'fast' ? subScores : undefined}
            />
          </div>

          {/* Main Category Pie Chart */}
          {selectedCategory === 'sentiment' && (
            <div className="mb-8">
              <CategoryPieChart
                title="Sentiment Distribution"
                data={pieChartData}
              />
            </div>
          )}

          {/* Subcategory Pie Charts */}
          {subcategoryCharts.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--foreground)' }}>
                {selectedCategory === 'dear_man' ? 'DEAR MAN' : 'FAST'} Breakdown
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subcategoryCharts.map((chart) => (
                  <CategoryPieChart
                    key={chart.subcategory}
                    title={chart.title}
                    data={chart.data}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
