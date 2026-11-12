--
-- PostgreSQL database dump
--

\restrict MfUlrVyT1GdiyjgekV3Fepd3ZbjtvUcqtImjiXbguFq2PXl9MCD7q4hjEJgZgkO

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


SET default_tablespace = '';

SET default_table_access_method = heap;

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
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO admin;

--
-- Data for Name: charts; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.charts (id, dashboard_id, source_ids, section, title, type, x_axis_field, y_axis_field, color, organization_id, refresh_interval) FROM stdin;
01a1d04b-2a23-73de-a2e6-8e1d6c9fc545	01a1c49f-f7d9-7618-b2cb-d287dd0cc028	["79784079-7045-4b24-9da4-10c9d4281f96"]	Загальний	Новий графік	{"79784079-7045-4b24-9da4-10c9d4281f96":"bar"}	Дохід	Дохід	{"79784079-7045-4b24-9da4-10c9d4281f96":"#1890ff"}	01a1c490-a8a6-778a-9f81-6f31f8532dfd	30
01a1cfe5-d4c8-75a1-8335-f026045a8005	01a1c49f-f7d9-7618-b2cb-d287dd0cc028	["79784079-7045-4b24-9da4-10c9d4281f96"]	Загальний	Новий графік	{"79784079-7045-4b24-9da4-10c9d4281f96":"bar"}	Місяць	Витрати	{"79784079-7045-4b24-9da4-10c9d4281f96":"#1890ff"}	01a1c490-a8a6-778a-9f81-6f31f8532dfd	10
01a1d19b-2e0e-703a-a16c-b54c1a4f309b	01a1c49f-f7d9-7618-b2cb-d287dd0cc028	["01a1c4bc-aff0-7106-a95d-461227078c93", "4eca074e-0c87-41d1-bfa7-4a9c85dff7d1"]	Загальний	Новий графік	{"01a1c4bc-aff0-7106-a95d-461227078c93":"line","4eca074e-0c87-41d1-bfa7-4a9c85dff7d1":"scatter"}	orders	orders	{"01a1c4bc-aff0-7106-a95d-461227078c93":"#1890ff","4eca074e-0c87-41d1-bfa7-4a9c85dff7d1":"#52c41a"}	01a1c490-a8a6-778a-9f81-6f31f8532dfd	10
\.


--
-- Data for Name: dashboards; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.dashboards (id, name, section_order, organization_id, charts_order) FROM stdin;
6006f024-8c2a-4eee-bc8c-acac72b1cf25	1	[]	6766ad29-3f03-4254-aeaf-bda270144020	{}
5b5e0373-3c7c-46cb-a29f-5765c1c253f9	Test	["Загальний", "Test"]	6766ad29-3f03-4254-aeaf-bda270144025	{"Загальний": [{"id": "27f3651b-ab2a-486f-8322-38a5ebd0a145", "span": 12}, {"id": "dec1b528-704b-49f3-9a43-346048f4f556", "span": 12}, {"id": "b4ae9fed-acff-4380-8175-9d843415ce47", "span": 24}, {"id": "30cac6df-43dc-47a7-ba97-ebcbf0644ab7", "span": 12}, {"id": "168718d1-3e0d-4236-8fb6-210097ebd0b8", "span": 12}]}
01a1c49f-f7d9-7618-b2cb-d287dd0cc028	Тест	[]	01a1c490-a8a6-778a-9f81-6f31f8532dfd	{"Загальний": [{"id": "01a1d04b-2a23-73de-a2e6-8e1d6c9fc545", "span": 12}, {"id": "01a1cfe5-d4c8-75a1-8335-f026045a8005", "span": 12}, {"id": "01a1d19b-2e0e-703a-a16c-b54c1a4f309b", "span": 24}]}
\.


--
-- Data for Name: data_sources; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.data_sources (id, name, type, url_or_path, status, last_sync, visible_fields, hidden_fields, organization_id) FROM stdin;
79784079-7045-4b24-9da4-10c9d4281f96	тест	csv	halych.csv	active	2026-10-22 09:19:46.462+00	["Місяць", "Дохід", "Витрати", "Клієнти"]	[]	a4a90577-c068-43fa-8503-b48a1813df73
db12621c-479b-4e4b-b90b-d26adcf02cf6	sensors-v1	rest	http://localhost:3001/sensors	active	\N	\N	\N	a4a90577-c068-43fa-8503-b48a1813df73
a8719aea-e82a-40ae-ad28-9ae7806767cf	1111	rest	http://localhost:3001/sales	active	2026-10-27 14:03:48.595+00	["month", "revenue", "orders"]	[]	6766ad29-3f03-4254-aeaf-bda270144020
01a1c4bc-aff0-7106-a95d-461227078c93	Sales	rest	http://localhost:3002/sales	active	2026-11-10 09:14:22.569+00	["orders"]	["month", "revenue"]	01a1c490-a8ff-747f-9ef3-a0ce7d22151e
4eca074e-0c87-41d1-bfa7-4a9c85dff7d1	sales-v2	rest	http://localhost:3002/sales	active	2026-10-23 05:18:59.043+00	["month", "revenue", "orders"]	["id"]	a4a90577-c068-43fa-8503-b48a1813df73
2321f9a8-6e98-443d-8532-9cd7c8344a60	Тест 2	rest	http://localhost:3001/users-demographics	active	\N	["category", "count"]	["id"]	a4a90577-c068-43fa-8503-b48a1813df73
01a1c49f-0fd6-7560-9bba-7ee706d01aa5	Sales2	rest	http://localhost:3001/sales	active	2026-11-10 09:48:31.232+00	["orders"]	["month", "revenue"]	01a1c490-a8ff-747f-9ef3-a0ce7d22151e
665eaf10-b080-4c9c-807c-fb103fcca8b6	sales-v1	rest	http://localhost:3001/sales	active	\N	["month", "revenue", "orders"]	["id"]	a4a90577-c068-43fa-8503-b48a1813df73
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

COPY public.users (id, email, password, organization_id, role, status, created_at) FROM stdin;
6766ad29-3f03-4254-aeaf-bda270144020	admin_login_1@example.com	$2b$10$Vi8zE.l0ED4XchmPzi3CwOka6dCBj.UzSgoizFJ3Tb5AynikEk1ve	870a8cf1-309e-40a8-bb22-59371e6242ab	ADMIN	ACTIVE	2026-11-12 12:13:17.494834
fdfc8a26-082a-462f-ae5a-203d54234222	admin_login@example.com	$2b$10$6dJQCRqSrvwrzIA8zcK9wekscmgTd033iuULl4KZ4P5Fd/Kag321.	691e52db-b75a-47d8-87a8-897370054313	ADMIN	ACTIVE	2026-11-12 12:13:17.494834
01a1cfc5-7764-7219-8344-5bfa1e519d47	admin-user-1@example.com	$2b$10$rRGu0QkgDUEJ/fHKgQmoAehecTfGG/s1eKpKDvWLhBHCbeTw5Q0aC	01a1c490-a8a6-778a-9f81-6f31f8532dfd	ADMIN	ACTIVE	2026-11-12 12:39:47.304221
a4a90577-c068-43fa-8503-b48a1813df73	admin@example.com	admin	01a1c490-a8a6-778a-9f81-6f31f8532dfd	MANAGER	ACTIVE	2026-11-12 12:13:17.494834
01a1c490-a8ff-747f-9ef3-a0ce7d22151e	admin-4@example.com	$2b$10$Hj/eOLli83SsEV/afFPv4e7RhW3I51ngW/x1GeqonCkxPL1DN2zeO	01a1c490-a8a6-778a-9f81-6f31f8532dfd	ANALYST	ACTIVE	2026-11-12 12:13:17.494834
\.


--
-- Name: charts PK_fa7124425552d2d37725307008b; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.charts
    ADD CONSTRAINT "PK_fa7124425552d2d37725307008b" PRIMARY KEY (id);


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
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: admin
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict MfUlrVyT1GdiyjgekV3Fepd3ZbjtvUcqtImjiXbguFq2PXl9MCD7q4hjEJgZgkO

