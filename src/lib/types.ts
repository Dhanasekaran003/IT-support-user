export type Envelope<T> = {
  success: boolean;
  data: T;
  error: { message: string; code: string } | null;
  meta?: { page: number; limit: number; total: number; pages: number };
};

export type User = {
  id?: string;
  _id?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  phone?: string | null;
  orgId?: string | null;
  siteId?: string | null;
  status?: string;
  mustChangePassword?: boolean;
};

export type Organization = {
  _id: string;
  name: string;
  gstNumber?: string;
  contractType?: string;
  status?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  industry?: string;
};

export type Site = {
  _id: string;
  orgId?: string;
  name: string;
  address?: string;
  city?: string;
  zone?: string;
  contactPerson?: string;
  contactPhone?: string;
};

export type Category = {
  _id: string;
  name: string;
  parentId?: string | null;
  priceModel?: string;
  basePrice?: number;
  amcIncluded?: boolean;
  checklist?: string[];
  active?: boolean;
  children?: Category[];
};

export type Asset = {
  _id: string;
  type: string;
  name?: string;
  assetTag: string;
  serialNumber?: string;
  warrantyExpiry?: string;
  specs?: string;
  status?: string;
  siteId?: Site | string;
};

export type Ticket = {
  _id: string;
  ticketNo: string;
  title?: string;
  description?: string;
  status: string;
  priority: string;
  orgId?: Organization | string;
  siteId?: Site | string;
  assetId?: Asset | string;
  categoryId?: Category | string;
  subCategoryId?: Category | string;
  assignedAgentId?: { userId?: { name?: string; phone?: string } | string } | string;
  slaResolveBy?: string;
  slaResolveBreached?: boolean;
  coveredByAmc?: boolean;
  checklist?: { item: string; done: boolean }[];
  history?: { status: string; ts: string; note?: string }[];
  photos?: string[];
  signature?: string;
  rating?: number;
  feedback?: string;
  partRequests?: { _id: string; status: string; qty: number; partId?: { name?: string } | string }[];
  createdAt?: string;
};

export type Contract = {
  _id: string;
  startDate: string;
  endDate: string;
  value: number;
  status: string;
  autoRenew?: boolean;
  notes?: string;
  slaTerms?: { responseMinutes?: number; resolutionMinutes?: number };
  coveredCategories?: Category[];
};

export type Invoice = {
  _id: string;
  invoiceNo: string;
  amount: number;
  gst: number;
  total: number;
  status: string;
  dueDate?: string;
  paidAt?: string;
  lineItems?: { description?: string; amount?: number }[];
};

export type PortalLookups = {
  priorities: string[];
  assetTypes: string[];
  ticketStatuses: string[];
  invoiceStatuses: string[];
  clientRoles: string[];
  contractTypes?: string[];
  industries?: string[];
  cities?: string[];
  zones?: string[];
};

export type RegisterOptions = {
  contractTypes: string[];
  industries: string[];
  cities: string[];
  zones: string[];
};

export type PortalMe = {
  user: User;
  org: Organization;
  sites: Site[];
};

export type PortalSummary = {
  openTickets: number;
  recentTickets: Ticket[];
  contract: Contract | null;
  unpaid: { total: number; count: number };
};
