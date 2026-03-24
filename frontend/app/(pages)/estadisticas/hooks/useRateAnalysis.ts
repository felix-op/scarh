"use client";

import { useMemo } from "react";
import {
	type ActiveRange,
	type ParsedMedicion,
	MIN_RATE_INTERVAL_MS,
	RATE_MAD_Z_THRESHOLD,
	computePercentile,
	getRateBucketSizeMs,
	getWindowDurationMs,
} from "../lib/estadisticas-domain";

type RatePoint = {
	timestamp: number;
	rate: number;
};

type RateSeriesPoint = {
	date: string;
	rate: number;
};

type RateSummary = {
	promedio: number | null;
	maxSubida: number | null;
	maxBajada: number | null;
};

export type RateByLimnigrafo = {
	limnigrafoId: number;
	rawRatePoints: RatePoint[];
	discardedRatePoints: number;
	rateSeriesData: RateSeriesPoint[];
	rateSummary: RateSummary;
};

type UseRateAnalysisOutput = {
	activeDurationMs: number;
	rawRatePoints: RatePoint[];
	discardedRatePoints: number;
	rateSeriesData: RateSeriesPoint[];
	rateSummary: RateSummary;
	rateByLimnigrafo: RateByLimnigrafo[];
};

function buildRateCandidates(rows: ParsedMedicion[]): RatePoint[] {
	const ordered = [...rows].sort((a, b) => a.timestamp - b.timestamp);
	const candidates: RatePoint[] = [];

	for (let index = 1; index < ordered.length; index += 1) {
		const previous = ordered[index - 1];
		const current = ordered[index];
		if (previous.altura_agua === null || current.altura_agua === null) {
			continue;
		}

		const deltaMs = current.timestamp - previous.timestamp;
		if (deltaMs < MIN_RATE_INTERVAL_MS) {
			continue;
		}

		const deltaHours = deltaMs / (60 * 60 * 1000);
		if (deltaHours <= 0) {
			continue;
		}

		const rate = (current.altura_agua - previous.altura_agua) / deltaHours;
		candidates.push({
			timestamp: current.timestamp,
			rate,
		});
	}

	return candidates.sort((a, b) => a.timestamp - b.timestamp);
}

function applyRobustMadFilter(candidates: RatePoint[]): RatePoint[] {
	if (candidates.length === 0) {
		return [];
	}

	const rates = candidates.map((item) => item.rate);
	const median = computePercentile(rates, 50);
	const mad = median === null
		? null
		: computePercentile(rates.map((value) => Math.abs(value - median)), 50);

	const filtered = median === null || mad === null || mad <= Number.EPSILON
		? candidates
		: candidates.filter((item) => {
			const robustZ = (0.6745 * (item.rate - median)) / mad;
			return Number.isFinite(robustZ) && Math.abs(robustZ) <= RATE_MAD_Z_THRESHOLD;
		});

	return filtered.map((item) => ({
		timestamp: item.timestamp,
		rate: Number(item.rate.toFixed(4)),
	}));
}

function buildRateSeriesData(rawRatePoints: RatePoint[], activeRange: ActiveRange | null): RateSeriesPoint[] {
	if (!activeRange || rawRatePoints.length === 0) {
		return [];
	}

	if (rawRatePoints.length <= 180) {
		return rawRatePoints.map((item) => ({
			date: new Date(item.timestamp).toISOString(),
			rate: item.rate,
		}));
	}

	const durationMs = activeRange.currentTo - activeRange.currentFrom;
	const bucketSizeMs = getRateBucketSizeMs(durationMs);
	const bucketMap = new Map<number, { sum: number; count: number }>();

	rawRatePoints.forEach((item) => {
		const bucket = activeRange.currentFrom + (Math.floor((item.timestamp - activeRange.currentFrom) / bucketSizeMs) * bucketSizeMs);
		const existing = bucketMap.get(bucket) ?? { sum: 0, count: 0 };
		existing.sum += item.rate;
		existing.count += 1;
		bucketMap.set(bucket, existing);
	});

	return Array.from(bucketMap.entries())
		.sort((a, b) => a[0] - b[0])
		.map(([bucket, aggregate]) => ({
			date: new Date(bucket).toISOString(),
			rate: Number((aggregate.sum / aggregate.count).toFixed(4)),
		}));
}

function computeRateSummary(rawRatePoints: RatePoint[]): RateSummary {
	if (rawRatePoints.length === 0) {
		return {
			promedio: null,
			maxSubida: null,
			maxBajada: null,
		};
	}

	const values = rawRatePoints.map((item) => item.rate);
	const promedio = values.reduce((acc, current) => acc + current, 0) / values.length;

	return {
		promedio,
		maxSubida: Math.max(...values),
		maxBajada: Math.min(...values),
	};
}

export default function useRateAnalysis(currentRows: ParsedMedicion[], activeRange: ActiveRange | null): UseRateAnalysisOutput {
	const activeDurationMs = useMemo(() => {
		if (!activeRange) {
			return getWindowDurationMs("24h");
		}

		return Math.max(60 * 1000, activeRange.currentTo - activeRange.currentFrom);
	}, [activeRange]);

	const rateComputation = useMemo(() => {
		const grouped = new Map<number, ParsedMedicion[]>();
		currentRows.forEach((medicion) => {
			if (medicion.altura_agua === null || !Number.isFinite(medicion.altura_agua)) {
				return;
			}

			const existing = grouped.get(medicion.limnigrafo) ?? [];
			existing.push(medicion);
			grouped.set(medicion.limnigrafo, existing);
		});

		const entries = Array.from(grouped.entries())
			.map(([limnigrafoId, rows]) => {
				const candidates = buildRateCandidates(rows);
				const filtered = applyRobustMadFilter(candidates);
				return {
					limnigrafoId,
					points: filtered,
					totalIntervals: candidates.length,
				};
			})
			.sort((a, b) => a.limnigrafoId - b.limnigrafoId);

		const rawRatePoints = entries
			.flatMap((entry) => entry.points)
			.sort((a, b) => a.timestamp - b.timestamp);
		const totalIntervals = entries.reduce((acc, entry) => acc + entry.totalIntervals, 0);
		const rateByLimnigrafo: RateByLimnigrafo[] = entries.map((entry) => ({
			limnigrafoId: entry.limnigrafoId,
			rawRatePoints: entry.points,
			discardedRatePoints: Math.max(0, entry.totalIntervals - entry.points.length),
			rateSeriesData: buildRateSeriesData(entry.points, activeRange),
			rateSummary: computeRateSummary(entry.points),
		}));

		return {
			rawRatePoints,
			totalIntervals,
			rateByLimnigrafo,
		};
	}, [activeRange, currentRows]);

	const rawRatePoints = rateComputation.rawRatePoints;
	const discardedRatePoints = Math.max(0, rateComputation.totalIntervals - rawRatePoints.length);

	const rateSeriesData = useMemo(
		() => buildRateSeriesData(rawRatePoints, activeRange),
		[activeRange, rawRatePoints],
	);

	const rateSummary = useMemo(
		() => computeRateSummary(rawRatePoints),
		[rawRatePoints],
	);

	return {
		activeDurationMs,
		rawRatePoints,
		discardedRatePoints,
		rateSeriesData,
		rateSummary,
		rateByLimnigrafo: rateComputation.rateByLimnigrafo,
	};
}
