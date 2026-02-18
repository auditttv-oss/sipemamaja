-- Seed data for SIPEMA (clusters + residents from constants)
insert into public.clusters (id, name, manager_name, total_units, occupied_units, cash_balance, security_status, last_audit_date) values
('cl-ruby', 'Cluster Ruby', 'Bpk. Hartono', 120, 98, 45000000, 'Aman', '2023-11-01'),
('cl-topaz', 'Cluster Topaz', 'Ibu Sarah', 85, 80, 32500000, 'Aman', '2023-11-05'),
('cl-sapphire', 'Cluster Sapphire', 'Bpk. Doni', 150, 45, 12000000, 'Siaga', '2023-10-28'),
('cl-kalimaya', 'Cluster Kalimaya', 'Bpk. Rahmat', 200, 180, 89000000, 'Aman', '2023-11-10')
on conflict (id) do update set
name = excluded.name,
manager_name = excluded.manager_name,
total_units = excluded.total_units,
occupied_units = excluded.occupied_units,
cash_balance = excluded.cash_balance,
security_status = excluded.security_status,
last_audit_date = excluded.last_audit_date;

insert into public.units (id, cluster_id, cluster, block, number, type, status, land_area, owner_name, resident_status, phone_number, family_members, bast_date) values
('u-rb-01', 'cl-ruby', 'Cluster Ruby', 'A', '01', '36/60', 'Sold', 60, 'Budi Santoso', 'Pemilik', '0812-3456-7890', 4, '2023-11-15'),
('u-rb-02', 'cl-ruby', 'Cluster Ruby', 'A', '02', '45/72', 'Sold', 72, 'Siti Aminah', 'Penyewa', '0813-9999-8888', 2, '2022-05-20'),
('u-tp-05', 'cl-topaz', 'Cluster Topaz', 'C', '12', '36/60', 'Available', 60, 'Developer Stock', 'Kosong', '-', 0, null),
('u-sp-10', 'cl-sapphire', 'Cluster Sapphire', 'F', '08', '60/90', 'Sold', 90, 'Rudi Hartono', 'Pemilik', '0811-2233-4455', 5, '2023-09-01'),
('u-kl-22', 'cl-kalimaya', 'Cluster Kalimaya', 'G', '22', '30/60', 'Sold', 60, 'Dewi Persik', 'Pemilik', '0815-6789-1234', 3, '2023-10-15')
on conflict (id) do update set
cluster_id = excluded.cluster_id,
cluster = excluded.cluster,
block = excluded.block,
number = excluded.number,
type = excluded.type,
status = excluded.status,
land_area = excluded.land_area,
owner_name = excluded.owner_name,
resident_status = excluded.resident_status,
phone_number = excluded.phone_number,
family_members = excluded.family_members,
bast_date = excluded.bast_date;

insert into public.residents (id, unit_id, name, phone, status, join_date) values
('11111111-1111-1111-1111-111111111111', 'u-rb-01', 'Budi Santoso', '0812-3456-7890', 'Active', '2023-11-15'),
('22222222-2222-2222-2222-222222222222', 'u-rb-02', 'Siti Aminah', '0813-9999-8888', 'Active', '2022-05-20'),
('33333333-3333-3333-3333-333333333333', 'u-sp-10', 'Rudi Hartono', '0811-2233-4455', 'Active', '2023-09-01'),
('44444444-4444-4444-4444-444444444444', 'u-kl-22', 'Dewi Persik', '0815-6789-1234', 'Active', '2023-10-15')
on conflict (id) do update set
unit_id = excluded.unit_id,
name = excluded.name,
phone = excluded.phone,
status = excluded.status,
join_date = excluded.join_date;
