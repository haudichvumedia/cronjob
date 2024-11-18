const express = require("express");
const cron = require("node-cron");
const cors = require("cors");

const app = express();
const PORT = 3000;

let jobs = []; // Lưu trữ các job

// Cấu hình CORS
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// API để lấy tất cả các tác vụ và trạng thái
app.get("/api/jobs", (req, res) => {
    res.json(jobs);
});

// API để thêm một tác vụ mới
app.post("/api/jobs", (req, res) => {
    const { name, url, interval } = req.body;

    if (!name || !url || !interval) {
        return res.status(400).json({ message: "Invalid input" });
    }

    const job = {
        id: Date.now(),
        name,
        url,
        interval,
        lastRun: null,
        status: "Pending", // Trạng thái ban đầu
    };

    // Lập lịch cronjob cho tác vụ
    const cronExpression = `*/${interval} * * * *`; // Cronjob chạy theo thời gian cài đặt
    cron.schedule(cronExpression, () => {
        console.log(`Executing job: ${job.name}, URL: ${job.url}`);
        // Cập nhật trạng thái thành "Running"
        job.status = "Running";

        // Thực hiện tác vụ (gọi URL)
        fetch(job.url)
            .then(response => {
                job.status = "Success"; // Nếu thành công
                job.lastRun = new Date().toLocaleString();
                console.log(`Job executed successfully`);
            })
            .catch(error => {
                job.status = "Failed"; // Nếu thất bại
                job.lastRun = new Date().toLocaleString();
                console.error(`Error executing job: ${error}`);
            });
    });

    jobs.push(job);
    res.status(201).json({ message: "Job created successfully!" });
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
