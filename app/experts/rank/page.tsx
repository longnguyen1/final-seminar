"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

interface ExpertRank {
  id: number
  fullName: string
  score?: number
  organization?: string
  degree?: string
}

export default function RankPage() {
  const [experts, setExperts] = useState<ExpertRank[]>([])

  useEffect(() => {
    fetch("/api/experts/score/all")
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort(
          (a: ExpertRank, b: ExpertRank) => (b.score ?? 0) - (a.score ?? 0)
        )
        setExperts(sorted.slice(0, 20))
      })
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>📊 Công thức tính điểm chuyên gia (Expert Score)</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Điểm chuyên gia được tính dựa trên các yếu tố sau:</p>
          <ul className="pl-5 mt-2 list-disc">
            <li><strong>Số công trình khoa học(publications)</strong>: 2 điểm / công trình</li>
            <li><strong>Số dự án(projects)</strong>: 3 điểm / dự án</li>
            <li><strong>Số nơi làm việc(workplaces)</strong>: 1 điểm / đơn vị</li>
            <li><strong>Số trường từng học(schools)</strong>: 1 điểm / trường</li>
            <li><strong>Số ngôn ngữ sử dụng(languages)</strong>: 1.5 điểm / ngôn ngữ</li>
          </ul>
          <p className="mt-2">
            Tổng điểm = 2 × publications + 3 × projects + 1 × workplaces + 1 × schools + 1.5 × languages
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🏆 Top 20 chuyên gia có điểm cao nhất</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>STT</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>Đơn vị</TableHead>
                <TableHead>Học vị</TableHead>
                <TableHead>Điểm chuyên gia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {experts.map((expert, index) => (
                <TableRow key={expert.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{expert.fullName}</TableCell>
                  <TableCell>{expert.organization || "N/A"}</TableCell>
                  <TableCell>{expert.degree || "N/A"}</TableCell>
                  <TableCell>
                    {typeof expert.score === "number" ? expert.score.toFixed(1) : "N/A"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📈 Biểu đồ điểm chuyên gia</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={experts} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fullName" angle={-35} textAnchor="end" interval={0} height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="score" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
