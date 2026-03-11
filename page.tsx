'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

type Company = {
  id: string
  company_name: string
  country: string | null
  city: string | null
  company_type: string | null
  specialization: string | null
  status: string | null
  notes: string | null
}

export default function HomePage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [form, setForm] = useState({
    company_name: '',
    country: '',
    city: '',
    company_type: '',
    specialization: '',
    status: 'new',
    notes: '',
  })

  useEffect(() => {
    loadCompanies()
  }, [])

  async function loadCompanies() {
    setLoading(true)

    const { data, error } = await supabase
      .from('companies')
      .select('id, company_name, country, city, company_type, specialization, status, notes')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Load companies error:', error)
    } else {
      setCompanies(data || [])
    }

    setLoading(false)
  }

  async function addCompany(e: React.FormEvent) {
    e.preventDefault()

    if (!form.company_name.trim()) {
      alert('Company name is required')
      return
    }

    const { error } = await supabase.from('companies').insert([
      {
        company_name: form.company_name.trim(),
        country: form.country.trim() || null,
        city: form.city.trim() || null,
        company_type: form.company_type.trim() || null,
        specialization: form.specialization.trim() || null,
        status: form.status.trim() || 'new',
        notes: form.notes.trim() || null,
      },
    ])

    if (error) {
      console.error('Insert company error:', error)
      alert('Could not add company')
      return
    }

    setForm({
      company_name: '',
      country: '',
      city: '',
      company_type: '',
      specialization: '',
      status: 'new',
      notes: '',
    })

    await loadCompanies()
  }

  const filteredCompanies = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return companies

    return companies.filter((company) =>
      [
        company.company_name,
        company.country,
        company.city,
        company.company_type,
        company.specialization,
        company.status,
        company.notes,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    )
  }, [companies, search])

  return (
    <main
      style={{
        padding: 24,
        maxWidth: 1200,
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif',
        color: '#111',
        background: '#f7f7f7',
        minHeight: '100vh',
      }}
    >
      <h1 style={{ marginBottom: 8 }}>Aterra CRM</h1>
      <p style={{ marginBottom: 24, color: '#555' }}>
        Companies database
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '380px 1fr',
          gap: 24,
          alignItems: 'start',
        }}
      >
        <section
          style={{
            background: '#fff',
            border: '1px solid #e5e5e5',
            borderRadius: 12,
            padding: 20,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Add Company</h2>

          <form onSubmit={addCompany} style={{ display: 'grid', gap: 12 }}>
            <input
              placeholder="Company name *"
              value={form.company_name}
              onChange={(e) => setForm({ ...form, company_name: e.target.value })}
              style={inputStyle}
            />

            <input
              placeholder="Country"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              style={inputStyle}
            />

            <input
              placeholder="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              style={inputStyle}
            />

            <input
              placeholder="Company type (carrier, forwarder, customs...)"
              value={form.company_type}
              onChange={(e) => setForm({ ...form, company_type: e.target.value })}
              style={inputStyle}
            />

            <input
              placeholder="Specialization"
              value={form.specialization}
              onChange={(e) => setForm({ ...form, specialization: e.target.value })}
              style={inputStyle}
            />

            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              style={inputStyle}
            >
              <option value="new">new</option>
              <option value="verified">verified</option>
              <option value="preferred">preferred</option>
              <option value="inactive">inactive</option>
            </select>

            <textarea
              placeholder="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }}
            />

            <button
              type="submit"
              style={{
                padding: '12px 16px',
                borderRadius: 10,
                border: 'none',
                background: '#111',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Save company
            </button>
          </form>
        </section>

        <section
          style={{
            background: '#fff',
            border: '1px solid #e5e5e5',
            borderRadius: 12,
            padding: 20,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              marginBottom: 16,
            }}
          >
            <h2 style={{ margin: 0 }}>Companies</h2>

            <input
              placeholder="Search companies"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, width: 280 }}
            />
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : filteredCompanies.length === 0 ? (
            <p>No companies found</p>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {filteredCompanies.map((company) => (
                <div
                  key={company.id}
                  style={{
                    border: '1px solid #e9e9e9',
                    borderRadius: 10,
                    padding: 16,
                    background: '#fafafa',
                  }}
                >
                  <div style={{ fontSize: 18, fontWeight: 700 }}>
                    {company.company_name}
                  </div>

                  <div style={{ color: '#666', marginTop: 6 }}>
                    {[company.country, company.city].filter(Boolean).join(' · ') || '—'}
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <strong>Type:</strong> {company.company_type || '—'}
                  </div>

                  <div style={{ marginTop: 4 }}>
                    <strong>Specialization:</strong> {company.specialization || '—'}
                  </div>

                  <div style={{ marginTop: 4 }}>
                    <strong>Status:</strong> {company.status || '—'}
                  </div>

                  {company.notes && (
                    <div style={{ marginTop: 8, color: '#444' }}>
                      <strong>Notes:</strong> {company.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid #dcdcdc',
  fontSize: 14,
  background: '#fff',
  color: '#111',
}