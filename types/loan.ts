export interface Prepayment {
  id: string;
  month: number;
  amount: number;
}

export interface Scenario {
  id: string;
  title: string; // Title add karo
  amount: number;
  rate: number;
  tenure: number;
}

export interface LoanState {
  amount: number;
  rate: number;
  tenure: number;

  theme: "light" | "dark";

  compareMode: boolean;

  scenarios: Scenario[];

  prepayments: Prepayment[];
}