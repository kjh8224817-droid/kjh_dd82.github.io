---
title: '야구 데이터(Sabermetrics)를 활용한 데이터 전처리 과정 연습'
date: 2026-05-11
tags: ['Data Analysis', 'Python', 'Pandas', 'Data Preprocessing']
category: 'Data Science'
description: '실무에서 자주 쓰이는 다양한 데이터 전처리(Data Preprocessing) 기법을 정리한 가이드입니다.'
---

# ⚾ 야구 데이터(Sabermetrics)를 활용한 데이터 전처리 과정 연습

이 문서는 제공해주신 `sabermetrics_2024.csv` 데이터와 오타니 쇼헤이(Shohei Ohtani) 선수의 예시를 바탕으로, 실무에서 자주 쓰이는 **다양한 데이터 전처리(Data Preprocessing) 기법**을 정리한 것입니다.

---

## 1. 데이터 불러오기 및 기본 확인

데이터 전처리의 가장 첫 단계는 데이터를 불러오고 구조를 파악하는 것입니다.

```python
import pandas as pd
import numpy as np

# 1. 데이터 불러오기
# 기존에 df 변수가 있다면 복사해서 사용하고, 없다면 csv 파일을 읽어옵니다.
try:
    df_2024 = df.copy()
except NameError:
    df_2024 = pd.read_csv('sabermetrics_2024.csv')

# 2. 데이터 기본 정보 확인
print(df_2024.info())       # 데이터 타입 및 결측치 확인
print(df_2024.describe())   # 수치형 데이터의 기초 통계량 확인
df_2024.head()              # 상위 5개 행 확인
```

---

## 2. 텍스트(문자열) 데이터 전처리

이름이나 카테고리 같은 문자열 데이터에 포함된 불필요한 공백, 특수문자 등을 정제합니다.

```python
# 선수 이름 중간에 대문자가 바로 이어지는 경우 공백 추가 (예: 'ShoheiOhtani' -> 'Shohei Ohtani')
if 'Player' in df_2024.columns:
    df_2024['Player'] = df_2024['Player'].str.replace(r'(?<=[a-z])(?=[A-Z])', ' ', regex=True)

# 기타 유용한 텍스트 전처리 기법
# df_2024['Player'] = df_2024['Player'].str.strip() # 양옆 공백 제거
# df_2024['Player'] = df_2024['Player'].str.upper() # 모두 대문자로 변환
# df_2024['Player'] = df_2024['Player'].str.lower() # 모두 소문자로 변환
```

---

## 3. 결측치(Missing Value) 처리

실제 데이터에는 값이 비어있는 경우(NaN)가 많습니다. 이를 분석 목적에 맞게 적절히 처리해야 합니다.

```python
# 1. 결측치 개수 확인
print(df_2024.isnull().sum())

# 2. 결측치 제거
# 특정 열(예: OPS)에 결측치가 있는 행만 완전히 제거
df_2024_cleaned = df_2024.dropna(subset=['OPS'])

# 3. 결측치 대체 (Imputation)
# 타석(AB) 데이터가 결측치인 경우 0으로 채우기
df_2024['AB'] = df_2024['AB'].fillna(0)

# 평균값으로 채우기 (예: 타율 AVG)
avg_mean = df_2024['AVG'].mean()
df_2024['AVG'] = df_2024['AVG'].fillna(avg_mean)
```

---

## 4. 파생 변수(Derived Variable) 생성

기존 데이터를 바탕으로 분석에 필요한 새로운 기준점(열)을 만듭니다.

```python
context_2024 = df_2024.copy()
selected_player = 'Shohei Ohtani'

# 1. 조건에 따른 파생 변수 생성 (np.where)
# 타겟 선수와 나머지 선수를 구분하는 그룹 라벨링
context_2024['selected_player'] = np.where(context_2024['Player'] == selected_player, 'Selected Player', 'Other Players')

# 2. 순위 및 백분위수 계산
# OPS 기준 순위 매기기 (높을수록 1등)
context_2024['OPS_rank_calc'] = context_2024['OPS'].rank(ascending=False, method='min').astype(int)

# OPS 상위 백분위 계산 (0 ~ 100%)
context_2024['OPS_percentile'] = (context_2024['OPS'].rank(pct=True) * 100).round(1)

# 3. 평균과의 차이 계산
# 전체 평균 OPS 대비 해당 선수의 차이
context_2024['OPS_vs_average'] = context_2024['OPS'] - context_2024['OPS'].mean()
```

---

## 5. 데이터 구간화 (Binning) 및 범주화

연속적인 숫자 데이터를 구간으로 나누어 범주형(그룹) 데이터로 묶어줍니다.

```python
# OPS 수치를 4분위수(Q1~Q4) 기준으로 4개의 등급으로 나누기
context_2024['ops_level'] = pd.cut(
    context_2024['OPS'],
    bins=[
        0,
        context_2024['OPS'].quantile(0.25), # 하위 25%
        context_2024['OPS'].quantile(0.5),  # 하위 50% (중앙값)
        context_2024['OPS'].quantile(0.75), # 하위 75%
        context_2024['OPS'].max() + 0.001   # 최댓값
    ],
    labels=['Q1 낮음', 'Q2 중하', 'Q3 중상', 'Q4 높음']
)

# 단순히 동일한 개수 비율로 N등분 하려면 pd.qcut 사용
# context_2024['ops_qcut'] = pd.qcut(context_2024['OPS'], q=4, labels=['하', '중하', '중상', '상'])
```

---

## 6. 이상치(Outlier) 탐지 및 처리

평균적인 흐름에서 비정상적으로 크게 벗어난 극단적인 값을 처리합니다. (IQR 방식)

```python
# OPS의 IQR(사분위수 범위) 계산
Q1 = context_2024['OPS'].quantile(0.25)
Q3 = context_2024['OPS'].quantile(0.75)
IQR = Q3 - Q1

# 이상치 경계선 설정 (일반적으로 1.5 * IQR을 기준으로 잡음)
lower_bound = Q1 - 1.5 * IQR
upper_bound = Q3 + 1.5 * IQR

# 1. 이상치 확인
outliers = context_2024[(context_2024['OPS'] < lower_bound) | (context_2024['OPS'] > upper_bound)]

# 2. 이상치 제거 (정상 범위 데이터만 남기기)
normal_data = context_2024[(context_2024['OPS'] >= lower_bound) & (context_2024['OPS'] <= upper_bound)]
```

---

## 7. 데이터 스케일링 (Scaling)

데이터의 단위가 다르거나, 머신러닝 분석에 사용할 때 값의 단위를 일정한 범위로 맞춥니다.

```python
from sklearn.preprocessing import StandardScaler, MinMaxScaler

# 1. 표준화 (Standardization): 평균 0, 표준편차 1로 변환
scaler = StandardScaler()
context_2024['OPS_standardized'] = scaler.fit_transform(context_2024[['OPS']])

# 2. 정규화 (Normalization): 0 ~ 1 사이의 값으로 변환
minmax_scaler = MinMaxScaler()
context_2024['OPS_minmax'] = minmax_scaler.fit_transform(context_2024[['OPS']])
```

---

## 8. 최종 결과 확인 및 저장

전처리가 완료된 데이터를 최종 확인하고, 태블로(Tableau)와 같은 시각화 툴이나 다른 분석에서 쓸 수 있도록 파일로 저장합니다.

```python
# 결과 상위 5개 확인
print(context_2024.head())

# 한글 깨짐 방지를 위해 encoding='utf-8-sig' 적용하여 CSV 형태로 저장
context_2024.to_csv('ohtani_2024_context_tableau_ready.csv', index=False, encoding='utf-8-sig')
```
