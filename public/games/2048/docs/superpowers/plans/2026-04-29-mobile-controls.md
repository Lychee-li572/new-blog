# 2048 移动端操作适配 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 2048 网页版增加移动端可用的滑动操作与方向按钮，同时保持桌面端继续只使用键盘方向键且不显示按钮。

**Architecture:** 把移动端输入判定拆成可测试的独立浏览器辅助脚本，由主页面脚本读取并绑定触摸滑动与按钮点击。页面布局只增加一个移动端控制区，并通过设备能力检测控制显示，不依赖仅凭屏幕宽度判断。

**Tech Stack:** HTML, CSS, 原生 JavaScript, Node.js `node:test`

---
