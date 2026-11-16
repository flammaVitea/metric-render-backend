--
-- PostgreSQL database dump
--

\restrict skua7exHvGcIBpPWnrVCuQCKouDkHsiNekbspU3zXIEdHQY1EUWfOLrEIqfs5V1

-- Dumped from database version 16.15 (Debian 16.15-1.pgdg13+2)
-- Dumped by pg_dump version 16.15 (Debian 16.15-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: admin
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO admin;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: admin
--

COMMENT ON SCHEMA public IS '';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    status text NOT NULL,
    "ipAddress" text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    organization_id uuid,
    CONSTRAINT audit_logs_status_check CHECK ((status = ANY (ARRAY['SUCCESS'::text, 'FAILED'::text, 'LOCKED_OUT'::text])))
);


ALTER TABLE public.audit_logs OWNER TO admin;

--
-- Name: charts; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.charts (
    id uuid NOT NULL,
    dashboard_id uuid NOT NULL,
    source_ids jsonb DEFAULT '[]'::jsonb NOT NULL,
    section text,
    title text NOT NULL,
    type text NOT NULL,
    x_axis_field text,
    y_axis_field text,
    color text,
    organization_id uuid NOT NULL,
    refresh_interval integer
);


ALTER TABLE public.charts OWNER TO admin;

--
-- Name: dashboards; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.dashboards (
    id uuid NOT NULL,
    name text NOT NULL,
    section_order jsonb DEFAULT '[]'::jsonb NOT NULL,
    organization_id uuid NOT NULL,
    charts_order jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public.dashboards OWNER TO admin;

--
-- Name: data_sources; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.data_sources (
    id uuid NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    url_or_path text NOT NULL,
    status text,
    last_sync timestamp with time zone,
    visible_fields jsonb,
    hidden_fields jsonb,
    organization_id uuid NOT NULL
);


ALTER TABLE public.data_sources OWNER TO admin;

--
-- Name: organizations; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.organizations (
    id uuid NOT NULL,
    name text NOT NULL,
    invite_code text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.organizations OWNER TO admin;

--
-- Name: users; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    organization_id uuid,
    role text DEFAULT 'MANAGER'::text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    is_two_factor_enabled boolean DEFAULT false NOT NULL
);


ALTER TABLE public.users OWNER TO admin;

--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.audit_logs (id, email, status, "ipAddress", created_at, organization_id) FROM stdin;
305c87eb-3844-45e4-9ea2-020aa100f04e	admin-5@example.com	SUCCESS	::1	2026-11-15 11:32:49.762598+00	01a1c490-a8a6-778a-9f81-6f31f8532dfd
d7efd9d7-e9cd-4395-a00a-ae2f357dd834	admin-5@example.com	FAILED	::1	2026-11-15 11:32:54.366388+00	01a1c490-a8a6-778a-9f81-6f31f8532dfd
73bb5632-b5ce-4406-afa4-5c0fa1692f0d	admin-5@example.com	FAILED	::1	2026-11-15 11:33:03.678058+00	01a1c490-a8a6-778a-9f81-6f31f8532dfd
9280d24c-3c63-4fd4-b409-64ee6f710d3e	admin-5@example.com	FAILED	::1	2026-11-15 11:33:07.747797+00	01a1c490-a8a6-778a-9f81-6f31f8532dfd
2b47e804-9297-4a52-b9d3-f129d870c9db	admin-5@example.com	FAILED	::1	2026-11-15 11:33:12.439337+00	01a1c490-a8a6-778a-9f81-6f31f8532dfd
e9ec07ae-f515-46a4-bebe-fc6ec785dd98	admin-5@example.com	FAILED	::1	2026-11-15 11:33:17.014849+00	01a1c490-a8a6-778a-9f81-6f31f8532dfd
53ec60ef-aff1-4de4-b7dc-1ebc8c452da3	admin-5@example.com	LOCKED_OUT	::1	2026-11-15 11:33:21.602633+00	01a1c490-a8a6-778a-9f81-6f31f8532dfd
1cd52a6d-8e71-41f4-8233-04e98a1730e7	admin-user-1@example.com	SUCCESS	::1	2026-11-15 11:35:04.277471+00	01a1c490-a8a6-778a-9f81-6f31f8532dfd
0bf783eb-b20a-4492-8a44-4cf5e0c30191	admin-user-1@example.com	SUCCESS	::1	2026-11-15 12:27:07.167372+00	01a1c490-a8a6-778a-9f81-6f31f8532dfd
be9c38dc-d4ec-4763-a94e-346b1cf62428	admin-user-1@example.com	SUCCESS	::1	2026-11-15 12:30:10.916783+00	01a1c490-a8a6-778a-9f81-6f31f8532dfd
78e1b9a0-679e-474d-b376-e4497becf349	admin-user-1@example.com	SUCCESS	::1	2026-11-15 12:55:37.366197+00	01a1c490-a8a6-778a-9f81-6f31f8532dfd
26a214a4-218b-461b-b79b-e88c3b413a8d	admin-6@example.com	SUCCESS	::1	2026-11-15 13:02:48.200601+00	01a1c490-a8a6-778a-9f81-6f31f8532dfd
5e14a00c-0dfe-4dcb-a76d-f852fc959108	admin-user-1@example.com	SUCCESS	::1	2026-11-15 13:16:13.502921+00	01a1c490-a8a6-778a-9f81-6f31f8532dfd
6ab49ef8-2446-42a9-a2f7-afd658ff946e	admin-7@example.com	SUCCESS	::1	2026-11-15 20:50:30.551712+00	01a1c490-a8a6-778a-9f81-6f31f8532dfd
982c6680-46ec-4c67-bf2a-07c8d2b5e371	admin-7@example.com	SUCCESS	::1	2026-11-15 20:51:42.735218+00	01a1c490-a8a6-778a-9f81-6f31f8532dfd
1c0dd846-e11e-4d8b-8ada-cdea79cedc23	admin@example.com	FAILED	::1	2026-11-15 20:52:19.651928+00	01a1c490-a8a6-778a-9f81-6f31f8532dfd
1f769d34-1ae4-4eaf-b93f-6f40880b4871	admin-user-1@example.com	SUCCESS	::1	2026-11-15 21:14:42.78053+00	01a1c490-a8a6-778a-9f81-6f31f8532dfd
5bcb3184-4a28-4930-927c-79e9d6d10553	admin-user-1@example.com	SUCCESS	::1	2026-11-15 21:15:39.802271+00	01a1c490-a8a6-778a-9f81-6f31f8532dfd
7223413b-7b66-414a-8bc8-f71158b063f4	admin-user-1@example.com	SUCCESS	::1	2026-11-15 21:16:02.203308+00	01a1c490-a8a6-778a-9f81-6f31f8532dfd
d2204f9e-4e89-4d7d-9af9-1560dd59424f	admin-user-1@example.com	SUCCESS	::1	2026-11-15 21:17:48.117846+00	01a1c490-a8a6-778a-9f81-6f31f8532dfd
47b4e4b9-e8c3-4151-8966-7ced8c9e5716	admin-user-1@example.com	SUCCESS	::1	2026-11-15 21:26:39.180309+00	01a1c490-a8a6-778a-9f81-6f31f8532dfd
31bca49c-959a-401c-a3c1-d6d4d0b7bd49	admin-9@example.com	SUCCESS	::1	2026-11-15 21:27:27.26284+00	01a1c490-a8a6-778a-9f81-6f31f8532dfd
85f6788c-2347-46d1-825f-fe4f05d76fa4	admin-9@example.com	SUCCESS	::1	2026-11-15 21:28:48.949713+00	01a1c490-a8a6-778a-9f81-6f31f8532dfd
bd7d3e1e-fbaf-4232-bb6e-bd841479cf6e	admin-9@example.com	FAILED	::1	2026-11-15 21:29:47.06968+00	01a1c490-a8a6-778a-9f81-6f31f8532dfd
f1808a44-d14a-4f03-9aeb-edd86fd2d8e9	admin-9@example.com	FAILED	::1	2026-11-15 21:30:09.807006+00	01a1c490-a8a6-778a-9f81-6f31f8532dfd
d1ea36c7-f193-4103-a10e-f5b8b5915017	admin-9@example.com	FAILED	::1	2026-11-15 21:30:20.582228+00	01a1c490-a8a6-778a-9f81-6f31f8532dfd
32a46715-ee20-4c5d-93d7-e4b013934d82	admin-9@example.com	FAILED	::1	2026-11-15 21:30:26.830338+00	01a1c490-a8a6-778a-9f81-6f31f8532dfd
f98905fb-e09e-472d-bbe0-70b44b89da62	admin-9@example.com	FAILED	::1	2026-11-15 21:30:28.920814+00	01a1c490-a8a6-778a-9f81-6f31f8532dfd
42f166d6-c64d-4a0f-8333-13cf07a4b815	admin-9@example.com	LOCKED_OUT	::1	2026-11-15 21:30:30.927216+00	01a1c490-a8a6-778a-9f81-6f31f8532dfd
\.


--
-- Data for Name: charts; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.charts (id, dashboard_id, source_ids, section, title, type, x_axis_field, y_axis_field, color, organization_id, refresh_interval) FROM stdin;
01a1d6c0-881e-77a3-b7c7-4b78f1a1a713	01a1c49f-f7d9-7618-b2cb-d287dd0cc028	["01a1d6bf-5d7e-720f-96f9-05462aae9618"]	Загальний	Новий графік	pie	month	revenue	{"01a1d6bf-5d7e-720f-96f9-05462aae9618":"#1890ff"}	01a1c490-a8a6-778a-9f81-6f31f8532dfd	10
01a1d6c3-7194-7306-8505-3e4d4624ddd2	01a1c49f-f7d9-7618-b2cb-d287dd0cc028	["01a1d6c1-bee1-701a-8422-5ff55ecc8acd"]	Загальний	Новий графік	{"01a1d6c1-bee1-701a-8422-5ff55ecc8acd":"area","01a1d6bf-5d7e-720f-96f9-05462aae9618":"bar"}	Місяць	Дохід	{"01a1d6c1-bee1-701a-8422-5ff55ecc8acd":"#1890ff","01a1d6bf-5d7e-720f-96f9-05462aae9618":"#52c41a"}	01a1c490-a8a6-778a-9f81-6f31f8532dfd	30
\.


--
-- Data for Name: dashboards; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.dashboards (id, name, section_order, organization_id, charts_order) FROM stdin;
6006f024-8c2a-4eee-bc8c-acac72b1cf25	1	[]	6766ad29-3f03-4254-aeaf-bda270144020	{}
5b5e0373-3c7c-46cb-a29f-5765c1c253f9	Test	["Загальний", "Test"]	6766ad29-3f03-4254-aeaf-bda270144025	{"Загальний": [{"id": "27f3651b-ab2a-486f-8322-38a5ebd0a145", "span": 12}, {"id": "dec1b528-704b-49f3-9a43-346048f4f556", "span": 12}, {"id": "b4ae9fed-acff-4380-8175-9d843415ce47", "span": 24}, {"id": "30cac6df-43dc-47a7-ba97-ebcbf0644ab7", "span": 12}, {"id": "168718d1-3e0d-4236-8fb6-210097ebd0b8", "span": 12}]}
01a1c49f-f7d9-7618-b2cb-d287dd0cc028	Тест	[]	01a1c490-a8a6-778a-9f81-6f31f8532dfd	{"Загальний": [{"id": "01a1d630-e9b3-70b1-9842-efa017a7d46a", "span": 24}, {"id": "01a1d04b-2a23-73de-a2e6-8e1d6c9fc545", "span": 12}, {"id": "01a1cfe5-d4c8-75a1-8335-f026045a8005", "span": 12}, {"id": "01a1d19b-2e0e-703a-a16c-b54c1a4f309b", "span": 24}]}
\.


--
-- Data for Name: data_sources; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.data_sources (id, name, type, url_or_path, status, last_sync, visible_fields, hidden_fields, organization_id) FROM stdin;
a8719aea-e82a-40ae-ad28-9ae7806767cf	1111	rest	http://localhost:3001/sales	active	2026-10-27 14:03:48.595+00	["month", "revenue", "orders"]	[]	6766ad29-3f03-4254-aeaf-bda270144020
4eca074e-0c87-41d1-bfa7-4a9c85dff7d1	sales-v2	rest	http://localhost:3002/sales	active	2026-10-23 05:18:59.043+00	["month", "revenue", "orders"]	["id"]	a4a90577-c068-43fa-8503-b48a1813df73
01a1c49f-0fd6-7560-9bba-7ee706d01aa5	Sales2	rest	http://localhost:3001/sales	active	2026-11-10 09:48:31.232+00	["orders"]	["month", "revenue"]	01a1c490-a8ff-747f-9ef3-a0ce7d22151e
665eaf10-b080-4c9c-807c-fb103fcca8b6	sales-v1	rest	http://localhost:3001/sales	active	\N	["month", "revenue", "orders"]	["id"]	a4a90577-c068-43fa-8503-b48a1813df73
01a1c4bc-aff0-7106-a95d-461227078c93	Sales	rest	http://localhost:3002/sales	active	2026-11-10 09:14:22.569+00	["orders"]	["month", "revenue"]	01a1c490-a8ff-747f-9ef3-a0ce7d22151e
2321f9a8-6e98-443d-8532-9cd7c8344a60	Тест 2	rest	http://localhost:3001/users-demographics	active	\N	["category", "count"]	["id"]	a4a90577-c068-43fa-8503-b48a1813df73
db12621c-479b-4e4b-b90b-d26adcf02cf6	sensors-v1	rest	http://localhost:3001/sensors	active	\N	["time", "temperature", "humidity"]	[]	a4a90577-c068-43fa-8503-b48a1813df73
01a1d6c1-bee1-701a-8422-5ff55ecc8acd	еуіе	csv	uploads/01a1c490-a8a6-778a-9f81-6f31f8532dfd/01a1d6c1-adca-704a-b0ee-5dd207824f8a.csv	active	2026-11-13 21:13:03.959+00	["Місяць", "Дохід", "Витрати", "Клієнти"]	[]	01a1c490-a8a6-778a-9f81-6f31f8532dfd
01a1d6bf-5d7e-720f-96f9-05462aae9618	екек	rest	http://localhost:3001/sales	active	2026-11-13 21:10:27.924+00	["month", "revenue", "orders"]	[]	01a1c490-a8a6-778a-9f81-6f31f8532dfd
\.


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.organizations (id, name, invite_code, created_at) FROM stdin;
691e52db-b75a-47d8-87a8-897370054313	Test Organization	ORG-D99339	2026-11-12 12:13:17.494834
65ddedab-1058-4d71-94ff-72d1bfb25e88	Test Organization	ORG-DD8805	2026-11-12 12:13:17.494834
870a8cf1-309e-40a8-bb22-59371e6242ab	Test Organization	ORG-253386	2026-11-12 12:13:17.494834
01a1c490-a8a6-778a-9f81-6f31f8532dfd	Test1 Organization	ORG-E200F5	2026-11-12 12:13:17.494834
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.users (id, email, password, organization_id, role, status, created_at, is_two_factor_enabled) FROM stdin;
6766ad29-3f03-4254-aeaf-bda270144020	admin_login_1@example.com	$2b$10$Vi8zE.l0ED4XchmPzi3CwOka6dCBj.UzSgoizFJ3Tb5AynikEk1ve	870a8cf1-309e-40a8-bb22-59371e6242ab	ADMIN	ACTIVE	2026-11-12 12:13:17.494834	f
fdfc8a26-082a-462f-ae5a-203d54234222	admin_login@example.com	$2b$10$6dJQCRqSrvwrzIA8zcK9wekscmgTd033iuULl4KZ4P5Fd/Kag321.	691e52db-b75a-47d8-87a8-897370054313	ADMIN	ACTIVE	2026-11-12 12:13:17.494834	f
a4a90577-c068-43fa-8503-b48a1813df73	admin@example.com	admin	01a1c490-a8a6-778a-9f81-6f31f8532dfd	MANAGER	ACTIVE	2026-11-12 12:13:17.494834	f
01a1c490-a8ff-747f-9ef3-a0ce7d22151e	admin-4@example.com	$2b$10$Hj/eOLli83SsEV/afFPv4e7RhW3I51ngW/x1GeqonCkxPL1DN2zeO	01a1c490-a8a6-778a-9f81-6f31f8532dfd	ANALYST	ACTIVE	2026-11-12 12:13:17.494834	f
01a1dee5-8f4a-7603-b846-79618a53916c	admin-5@example.com	$2b$10$jq6kPeKkYnhvlCpS3GDLFOQtVTXcTQFebAEWzd8D0.NLSa3ojRKj2	01a1c490-a8a6-778a-9f81-6f31f8532dfd	INTEGRATOR	ACTIVE	2026-11-15 11:09:08.828713	f
01a1defe-4118-7277-9ce2-af1cf73559eb	admin-6@example.com	$2b$10$r3rwHyF3jpuNg3rMW1gdOOG3QcuDCTmJf7jD.tJkyFJIE0/aPWgcK	01a1c490-a8a6-778a-9f81-6f31f8532dfd	MANAGER	ACTIVE	2026-11-15 11:36:07.168169	f
01a1e0f9-2242-70ba-ad52-c534cb67c14b	admin-7@example.com	$2b$10$LdUkYDXsFk6YaX6iZs7qAearOKImJjuZwFarbOraYyiQ3sASysCHy	01a1c490-a8a6-778a-9f81-6f31f8532dfd	ANALYST	ACTIVE	2026-11-15 20:49:46.043032	f
01a1cfc5-7764-7219-8344-5bfa1e519d47	admin-user-1@example.com	$2b$10$rRGu0QkgDUEJ/fHKgQmoAehecTfGG/s1eKpKDvWLhBHCbeTw5Q0aC	01a1c490-a8a6-778a-9f81-6f31f8532dfd	ADMIN	ACTIVE	2026-11-12 12:39:47.304221	t
01a1e11a-1e86-75b8-92a2-d8a2d709096d	admin-9@example.com	$2b$10$6KL6Gz6NubMONAKddLE3y.j7J7NRvWPiv2AAkD6.q5ThZIcjGFtSm	01a1c490-a8a6-778a-9f81-6f31f8532dfd	MANAGER	ACTIVE	2026-11-15 21:25:47.811435	f
\.


--
-- Name: charts PK_fa7124425552d2d37725307008b; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.charts
    ADD CONSTRAINT "PK_fa7124425552d2d37725307008b" PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: dashboards dashboards_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.dashboards
    ADD CONSTRAINT dashboards_pkey PRIMARY KEY (id);


--
-- Name: data_sources data_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.data_sources
    ADD CONSTRAINT data_sources_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_invite_code_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_invite_code_key UNIQUE (invite_code);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (email);


--
-- Name: idx_audit_logs_organization_created_at; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_audit_logs_organization_created_at ON public.audit_logs USING btree (organization_id, created_at DESC);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: admin
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict skua7exHvGcIBpPWnrVCuQCKouDkHsiNekbspU3zXIEdHQY1EUWfOLrEIqfs5V1

