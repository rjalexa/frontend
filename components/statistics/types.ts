// components/statistics/types.ts
export interface IListItem {
  label: string;
  value: number;
}

export interface IBaseStatsCardProps {
  title: string;
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
}

export interface IStatsCardProps extends IBaseStatsCardProps {
  value?: number;
}

export interface IListStatsCardProps extends IBaseStatsCardProps {
  items?: IListItem[];
}

export interface IErrorResponse {
  error: string;
}

export interface IDateRange {
  oldestDate?: string;
  mostRecentDate?: string;
}

export interface IQueryStatus {
  status: Record<string, "loading" | "success" | "error">;
  errorMessage?: string;
}

export interface IQueryResults {
  dateRange?: IDateRange;
  totalArticles?: number;
  uniqueAuthors?: number;
  uniqueLocations?: number;
  totalPeople?: number;
  topAuthors?: IListItem[];
  topLocations?: IListItem[];
  topPeople?: IListItem[];
}
